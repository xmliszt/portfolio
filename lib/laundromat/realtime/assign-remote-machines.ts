import type { MachineKind } from "@/lib/laundromat/scene-config";

import { getRegionTier } from "./get-region-tier";
import type { RemoteLoad, RoomRegion } from "./room-presence";

const MAX_OTHERS_PER_KIND = 3;
const DONE_LINGER_MS = 90_000;

export type RemoteMachine = {
  visitorId: string;
  endsAt: number;
};

function hashVisitorId(visitorId: string) {
  return [...visitorId].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    7
  );
}

/** Return which of `machines` show another visitor's load, keyed by machine id: one per visitor, at most three per kind, nearest to `ownRegion` first and then earliest started, never `ownMachineId`, and always one machine of each kind left free while the visitor's own laundry is not in that kind; a load lingers `DONE_LINGER_MS` after it ends, and each visitor keeps the slot their id hashes to whenever it is free. */
export function assignRemoteMachines(options: {
  machines: { id: string; kind: MachineKind }[];
  ownMachineId: string | undefined;
  others: { visitorId: string; region?: RoomRegion; load: RemoteLoad }[];
  ownRegion: RoomRegion | undefined;
  now: number;
}) {
  const kinds: MachineKind[] = ["washer", "dryer"];
  const seenVisitorIds = new Set<string>();
  const uniqueOthers = options.others.filter(({ visitorId }) => {
    if (seenVisitorIds.has(visitorId)) return false;
    seenVisitorIds.add(visitorId);
    return true;
  });
  return Object.fromEntries(
    kinds.flatMap((kind) => {
      const slots = options.machines.filter(
        (machine) =>
          machine.kind === kind && machine.id !== options.ownMachineId
      );
      const isOwnInKind = options.machines.some(
        (machine) =>
          machine.kind === kind && machine.id === options.ownMachineId
      );
      const capacity = Math.min(
        MAX_OTHERS_PER_KIND,
        slots.length - (isOwnInKind ? 0 : 1)
      );
      const visible = uniqueOthers
        .filter(({ load }) => load.kind === kind)
        .map(({ visitorId, region, load }) => ({
          visitorId,
          endsAt: load.startedAt + load.durationMs,
          startedAt: load.startedAt,
          tier: getRegionTier({ own: options.ownRegion, other: region }),
        }))
        .filter(({ endsAt }) => options.now < endsAt + DONE_LINGER_MS)
        .toSorted(
          (a, b) =>
            a.tier - b.tier ||
            a.startedAt - b.startedAt ||
            a.visitorId.localeCompare(b.visitorId)
        )
        .slice(0, Math.max(0, capacity));
      return visible.reduce<[string, RemoteMachine][]>((taken, other) => {
        const free = slots.filter(
          (slot) => !taken.some(([id]) => id === slot.id)
        );
        const preferred = hashVisitorId(other.visitorId) % slots.length;
        const slot =
          free.find((candidate) => candidate.id === slots[preferred]?.id) ??
          free.at(0);
        if (slot === undefined) return taken;
        return [
          ...taken,
          [slot.id, { visitorId: other.visitorId, endsAt: other.endsAt }],
        ];
      }, []);
    })
  );
}
