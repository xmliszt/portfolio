/** Return `true` if another station is worth trying after the last `failedStreak` stations failed in a row; `false` when all `stationCount` stations have failed. */
export function shouldSkipStation(options: {
  failedStreak: number;
  stationCount: number;
}) {
  return options.failedStreak < options.stationCount;
}
