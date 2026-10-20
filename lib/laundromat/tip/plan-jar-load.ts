export type JarLoadState = {
  isLoading: boolean;
  isQueued: boolean;
  loadedAt?: number;
};

export type JarLoadPlan =
  | { kind: "load" }
  | { kind: "after-load" }
  | { kind: "later"; afterMs: number }
  | { kind: "skip" };

/** Return what to do with a request to reload the jar at `now`: nothing when one is already queued, queue it after the load in flight, queue it until `minGapMs` has passed since the last load, or load now. */
export function planJarLoad(options: {
  state: JarLoadState;
  now: number;
  minGapMs: number;
}): JarLoadPlan {
  const { state, now, minGapMs } = options;
  if (state.isQueued) return { kind: "skip" };
  if (state.isLoading) return { kind: "after-load" };
  const sinceMs =
    state.loadedAt === undefined ? Infinity : now - state.loadedAt;
  return sinceMs < minGapMs
    ? { kind: "later", afterMs: minGapMs - sinceMs }
    : { kind: "load" };
}
