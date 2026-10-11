export type CoffeePhase =
  | { kind: "idle" }
  | { kind: "brewing"; progress: number }
  | { kind: "hot" };

/** Return whether the coffee machine started at `brewStartedAt` is idle, brewing (with 0–1 `progress`) or holding a hot cup at `now`. */
export function getCoffeePhase(options: {
  brewStartedAt: number | undefined;
  now: number;
  brewMs: number;
  hotMs: number;
}): CoffeePhase {
  const { brewStartedAt, now, brewMs, hotMs } = options;
  if (brewStartedAt === undefined) return { kind: "idle" };
  const elapsedMs = now - brewStartedAt;
  if (elapsedMs < 0) return { kind: "idle" };
  if (elapsedMs < brewMs) {
    return { kind: "brewing", progress: elapsedMs / brewMs };
  }
  return elapsedMs < brewMs + hotMs ? { kind: "hot" } : { kind: "idle" };
}
