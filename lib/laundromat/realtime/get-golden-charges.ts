import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";
import type { ChargeCheck } from "@/lib/laundromat/tip/tip-token";

import { getClockOffsetMs } from "./get-clock-offset-ms";
import type { GoldenCharge, RoomPresence } from "./room-presence";

/** Return the golden charges still within `GOLDEN_CHARGE_MS.max` at `now`: this tab's `own` ones, then each peer's whose attempt `checks` found spent into that machine with `endsAtMs` after `now`, with its start moved onto the local clock by `offsetsMs` and no later than `now`, each marked `isOwn`. */
export function getGoldenCharges(options: {
  own: GoldenCharge[];
  peers: RoomPresence[];
  checks: { [attempt: string]: ChargeCheck };
  offsetsMs: { [visitorId: string]: number };
  now: number;
}) {
  const remote = options.peers.flatMap(({ visitorId, goldenCharges = [] }) => {
    const offsetMs =
      getClockOffsetMs({ offsetsMs: options.offsetsMs, visitorId }) ?? 0;
    return goldenCharges.flatMap((charge) => {
      const check = options.checks[charge.attempt];
      if (
        check?.kind !== "spent" ||
        check.machineId !== charge.machineId ||
        options.now >= check.endsAtMs
      ) {
        return [];
      }
      return [
        {
          machineId: charge.machineId,
          attempt: charge.attempt,
          startedAt: Math.min(charge.startedAt + offsetMs, options.now),
          isOwn: false,
        },
      ];
    });
  });
  return [
    ...options.own.map((charge) => ({ ...charge, isOwn: true })),
    ...remote,
  ].filter(({ startedAt }) => options.now < startedAt + GOLDEN_CHARGE_MS.max);
}
