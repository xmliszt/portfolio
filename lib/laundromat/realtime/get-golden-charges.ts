import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";

import { getClockOffsetMs } from "./get-clock-offset-ms";
import type { GoldenCharge, RoomPresence } from "./room-presence";

/** Return the golden charges still within `GOLDEN_CHARGE_MS.max` at `now`: this tab's `own` ones, then each peer's with its start moved onto the local clock by `offsetsMs` and no later than `now`, each marked `isOwn`. */
export function getGoldenCharges(options: {
  own: GoldenCharge[];
  peers: RoomPresence[];
  offsetsMs: { [visitorId: string]: number };
  now: number;
}) {
  const remote = options.peers.flatMap(({ visitorId, goldenCharges = [] }) => {
    const offsetMs =
      getClockOffsetMs({ offsetsMs: options.offsetsMs, visitorId }) ?? 0;
    return goldenCharges.map((charge) => ({
      machineId: charge.machineId,
      startedAt: Math.min(charge.startedAt + offsetMs, options.now),
      isOwn: false,
    }));
  });
  return [
    ...options.own.map((charge) => ({ ...charge, isOwn: true })),
    ...remote,
  ].filter(({ startedAt }) => options.now < startedAt + GOLDEN_CHARGE_MS.max);
}
