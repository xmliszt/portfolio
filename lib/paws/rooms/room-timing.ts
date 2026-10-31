/** How long a room member stays in the room without a heartbeat, how often the client sends one, and how many joins one user may make in a window. */
export const ROOM_TIMING = {
  memberFreshMs: 90_000,
  heartbeatMs: 20_000,
  joinWindowMs: 10 * 60_000,
  maxJoinsPerWindow: 20,
} as const;
