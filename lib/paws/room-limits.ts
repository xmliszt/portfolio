/** Size of the shared world every screen scales to fit, and the limits and send rates of one room. */
export const ROOM_LIMITS = {
  worldWidth: 1600,
  worldHeight: 1000,
  maxPlayers: 8,
  maxWatchers: 4,
  fingerSendsPerSecond: 2,
  catSnapshotsPerSecond: 4,
  renderDelayMs: 350,
  maxCuriousCats: 3,
} as const;
