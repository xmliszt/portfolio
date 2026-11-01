import { formatSgt } from "./format-sgt";

const MINUTE_MS = 60_000;

/** A reason a hand-picked time crowds the campaign's other posts. */
export type ScheduleClash =
  | { kind: "gap"; postId: string; at: Date; minutesApart: number }
  | { kind: "day"; count: number };

function toDay(date: Date) {
  return formatSgt({ date, pattern: "yyyy-MM-dd" });
}

/** Return how `at` crowds the other unskipped `post` and `repost` rows in `posts` (not `postId`): a `gap` clash for each one less than `minGapMinutes` away, then a `day` clash when its Singapore day already holds `maxPerDay` or more of them. */
export function findScheduleClashes(options: {
  at: Date;
  postId: string | undefined;
  posts: readonly { id: string; at: Date; kind: string; status: string }[];
  minGapMinutes: number;
  maxPerDay: number;
}): ScheduleClash[] {
  const others = options.posts.filter(
    (post) =>
      post.id !== options.postId &&
      (post.kind === "post" || post.kind === "repost") &&
      post.status !== "skipped"
  );
  const gaps = others.flatMap((post): ScheduleClash[] => {
    const minutesApart = Math.round(
      Math.abs(post.at.getTime() - options.at.getTime()) / MINUTE_MS
    );
    return minutesApart < options.minGapMinutes
      ? [{ kind: "gap", postId: post.id, at: post.at, minutesApart }]
      : [];
  });
  const day = toDay(options.at);
  const count = others.filter((post) => toDay(post.at) === day).length;
  return count >= options.maxPerDay ? [...gaps, { kind: "day", count }] : gaps;
}
