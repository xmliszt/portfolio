/** Return the blessing word for a streak of `count`, cycling through `blessings`, and whether `count` starts a clover shower: every `cloverStreak`th touch below `maxStreak`. */
export function getStreakReward(options: {
  count: number;
  cloverStreak: number;
  maxStreak: number;
  blessings: string[];
}) {
  const { count, blessings } = options;
  return {
    word: blessings[(count - 1) % blessings.length],
    isShower: count < options.maxStreak && count % options.cloverStreak === 0,
  };
}
