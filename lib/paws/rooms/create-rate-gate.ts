const WINDOW_MS = 1000;

/** Return a gate whose `allow` returns `true` and records the message when fewer than `maxPerSecond` messages from `senderId` were let through in the second before `now()`, and `false` otherwise. */
export function createRateGate(options: {
  maxPerSecond: number;
  now: () => number;
}) {
  const state: { sentAts: { [senderId: string]: number[] } } = { sentAts: {} };
  return {
    allow(senderId: string) {
      const now = options.now();
      const recent = (state.sentAts[senderId] ?? []).filter(
        (sentAt) => sentAt > now - WINDOW_MS
      );
      const isAllowed = recent.length < options.maxPerSecond;
      state.sentAts = {
        ...Object.fromEntries(
          Object.entries(state.sentAts).filter(([, sentAts]) =>
            sentAts.some((sentAt) => sentAt > now - WINDOW_MS)
          )
        ),
        [senderId]: isAllowed ? [...recent, now] : recent,
      };
      return isAllowed;
    },
  };
}
