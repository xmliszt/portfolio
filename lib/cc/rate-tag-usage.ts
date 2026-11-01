export type TagUsageRating = "quiet" | "good" | "busy" | "crowded";

const X_WEEKLY_LIMITS = { quiet: 20, good: 2_000, busy: 20_000 } as const;
const THREADS_CAP = 25;
const HOUR_MS = 60 * 60 * 1000;

/** Rate how worthwhile a tag or phrase is from recent usage: X by posts in the last 7 days; Threads by how many of the latest results came back (capped at 25) and how old the newest one is. */
export function rateTagUsage(
  usage:
    | { platform: "x"; weeklyPosts: number }
    | {
        platform: "threads";
        count: number;
        newestAt: Date | undefined;
        now: Date;
      }
): TagUsageRating {
  switch (usage.platform) {
    case "x":
      if (usage.weeklyPosts < X_WEEKLY_LIMITS.quiet) return "quiet";
      if (usage.weeklyPosts <= X_WEEKLY_LIMITS.good) return "good";
      if (usage.weeklyPosts <= X_WEEKLY_LIMITS.busy) return "busy";
      return "crowded";
    case "threads": {
      if (usage.count < 3) return "quiet";
      if (usage.count < THREADS_CAP) return "good";
      const ageMs =
        usage.newestAt === undefined
          ? Infinity
          : usage.now.getTime() - usage.newestAt.getTime();
      return ageMs < HOUR_MS ? "busy" : "good";
    }
    default: {
      const unhandled: never = usage;
      return unhandled;
    }
  }
}
