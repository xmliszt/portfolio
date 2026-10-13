/** Return how far the local clock runs ahead of `visitorId`'s clock in `offsetsMs`, or `undefined` when it is not known. */
export function getClockOffsetMs(options: {
  offsetsMs: { [visitorId: string]: number };
  visitorId: string;
}) {
  return Object.hasOwn(options.offsetsMs, options.visitorId)
    ? options.offsetsMs[options.visitorId]
    : undefined;
}
