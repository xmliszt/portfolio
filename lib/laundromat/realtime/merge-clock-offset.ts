import { getClockOffsetMs } from "./get-clock-offset-ms";
import type { RemoteClock } from "./room-presence";

export const MAX_CLOCK_OFFSET_MS = 10 * 60_000;

/** Return `offsetsMs` with `clock.visitorId`'s offset (local time minus that visitor's time) set to `receivedAt - clock.sentAt` when it is the smallest seen so far, or `offsetsMs` itself when it is not or lies beyond `MAX_CLOCK_OFFSET_MS`. */
export function mergeClockOffset(options: {
  offsetsMs: { [visitorId: string]: number };
  clock: RemoteClock;
  receivedAt: number;
}) {
  const { offsetsMs, clock } = options;
  const sampleMs = options.receivedAt - clock.sentAt;
  const knownMs = getClockOffsetMs({ offsetsMs, visitorId: clock.visitorId });
  if (Math.abs(sampleMs) > MAX_CLOCK_OFFSET_MS) return offsetsMs;
  // Delivery delay only ever adds to a sample, so the smallest one is the closest to the true offset.
  if (knownMs !== undefined && knownMs <= sampleMs) return offsetsMs;
  return { ...offsetsMs, [clock.visitorId]: sampleMs };
}
