import { getClockOffsetMs } from "@/lib/laundromat/realtime/get-clock-offset-ms";

import type { CoffeeFlask } from "./coffee-state";

/** Return how far the local clock runs ahead of the clock of whoever brewed `flask`, from `clockOffsetsMs`; `0` when this visitor brewed it, nobody did, or their offset is unknown. */
export function getFlaskClockOffsetMs(options: {
  flask: CoffeeFlask;
  ownVisitorId: string | undefined;
  clockOffsetsMs: { [visitorId: string]: number };
}) {
  const { brewedBy } = options.flask;
  if (brewedBy === undefined || brewedBy === options.ownVisitorId) return 0;
  return (
    getClockOffsetMs({
      offsetsMs: options.clockOffsetsMs,
      visitorId: brewedBy,
    }) ?? 0
  );
}
