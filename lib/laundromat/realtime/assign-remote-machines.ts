import type { MachineKind } from "@/lib/laundromat/scene-config";

import { getRegionTier } from "./get-region-tier";
import type { RemoteLoad, RoomRegion } from "./room-presence";

const MAX_OTHERS_PER_KIND = 3;
const DONE_LINGER_MS = 90_000;

export type RemoteMachine = {
  visitorId: string;
  load: RemoteLoad;
};

function getSortStart(load: RemoteLoad) {
  switch (load.phase) {
    case "done":
      return 0;
    case "running":
      return load.startedAt;
    case "loaded":
      return Number.MAX_SAFE_INTEGER;
    default: {
      const unhandled: never = load;
      return unhandled;
    }
  }
}

function isShown(options: { load: RemoteLoad; now: number }) {
  const { load } = options;
  return (
    load.phase !== "running" ||
    options.now < load.startedAt + load.durationMs + DONE_LINGER_MS
  );
}

function hashVisitorId(visitorId: string) {
  return [...visitorId].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    7
  );
}

/** Return which of `machines` hold another visitor's laundry, keyed by machine id: one per visitor, at most three per kind, nearest to `ownRegion` first, then done before running (earliest started first) before loaded, never `ownMachineId`, and always one machine of each kind left free while the visitor's own laundry is not in that kind; a running load lingers `DONE_LINGER_MS` after it ends, loaded and done loads stay until the visitor takes them out, each load sits in the machine its `machineId` names when that machine is free, and otherwise in the machine of its kind the visitor's id hashes to when that one is free, or the first free one. */
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
      const kindMachines = options.machines.filter(
        (machine) => machine.kind === kind
      );
      const slots = kindMachines.filter(
        (machine) => machine.id !== options.ownMachineId
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
        .filter(
          ({ load }) =>
            load.kind === kind && isShown({ load, now: options.now })
        )
        .map(({ visitorId, region, load }) => ({
          visitorId,
          load,
          sortStart: getSortStart(load),
          tier: getRegionTier({ own: options.ownRegion, other: region }),
        }))
        .toSorted(
          (a, b) =>
            a.tier - b.tier ||
            a.sortStart - b.sortStart ||
            a.visitorId.localeCompare(b.visitorId)
        )
        .slice(0, Math.max(0, capacity));
      const claimedMachines = visible.reduce<[string, RemoteMachine][]>(
        (taken, other) => {
          const slot = slots.find(
            (candidate) =>
              candidate.id === other.load.machineId &&
              !taken.some(([id]) => id === candidate.id)
          );
          if (slot === undefined) return taken;
          return [
            ...taken,
            [slot.id, { visitorId: other.visitorId, load: other.load }],
          ];
        },
        []
      );
      return visible
        .filter(
          (other) =>
            !claimedMachines.some(
              ([, placed]) => placed.visitorId === other.visitorId
            )
        )
        .reduce<[string, RemoteMachine][]>((taken, other) => {
          const free = slots.filter(
            (slot) => !taken.some(([id]) => id === slot.id)
          );
          const preferred = kindMachines.at(
            hashVisitorId(other.visitorId) % kindMachines.length
          );
          const slot =
            free.find((candidate) => candidate.id === preferred?.id) ??
            free.at(0);
          if (slot === undefined) return taken;
          return [
            ...taken,
            [slot.id, { visitorId: other.visitorId, load: other.load }],
          ];
        }, claimedMachines);
    })
  );
}
