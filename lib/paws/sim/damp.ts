/** Return `from` moved toward `to` by an exponential step of `rate` per second over `dtSeconds`, the same at any frame rate. */
export function damp(options: {
  from: number;
  to: number;
  rate: number;
  dtSeconds: number;
}) {
  return (
    options.from +
    (options.to - options.from) *
      (1 - Math.exp(-options.rate * options.dtSeconds))
  );
}
