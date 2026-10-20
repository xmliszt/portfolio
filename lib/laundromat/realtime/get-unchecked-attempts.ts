import type { ChargeCheck } from "@/lib/laundromat/tip/tip-token";

import type { RoomPresence } from "./room-presence";

/** Return each attempt in the `peers`' golden charges that has no entry in `checks`, once. */
export function getUncheckedAttempts(options: {
  peers: RoomPresence[];
  checks: { [attempt: string]: ChargeCheck };
}) {
  const attempts = options.peers.flatMap(({ goldenCharges = [] }) =>
    goldenCharges.map(({ attempt }) => attempt)
  );
  return [...new Set(attempts)].filter(
    (attempt) => options.checks[attempt] === undefined
  );
}
