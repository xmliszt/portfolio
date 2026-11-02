/** Resolve after `durationMs` milliseconds. */
export function wait(durationMs: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, durationMs));
}
