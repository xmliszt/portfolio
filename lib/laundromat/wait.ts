/** Return a promise that resolves after `durationMs`. */
export function wait(durationMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}
