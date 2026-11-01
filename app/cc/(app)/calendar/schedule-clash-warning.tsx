import { findScheduleClashes } from "@/lib/cc/find-schedule-clashes";
import { formatSgt } from "@/lib/cc/format-sgt";

/** The campaign's scheduled posts and spacing rules a hand-picked time is checked against, with `at` as an ISO string. */
export type ScheduleContext = {
  posts: readonly { id: string; at: string; kind: string; status: string }[];
  minGapMinutes: number;
  maxPerDay: number;
};

type ScheduleClashWarningProps = {
  at: Date;
  postId: string | undefined;
  schedule: ScheduleContext;
};

export function ScheduleClashWarning(props: ScheduleClashWarningProps) {
  if (Number.isNaN(props.at.getTime())) return null;
  const clashes = findScheduleClashes({
    at: props.at,
    postId: props.postId,
    posts: props.schedule.posts.map((post) => ({
      ...post,
      at: new Date(post.at),
    })),
    minGapMinutes: props.schedule.minGapMinutes,
    maxPerDay: props.schedule.maxPerDay,
  });
  const lines = clashes.map((clash) => {
    switch (clash.kind) {
      case "gap":
        return {
          key: clash.postId,
          text: `Another post is at ${formatSgt({ date: clash.at, pattern: "HH:mm" })} SGT, ${clash.minutesApart} min away; the plan keeps ${props.schedule.minGapMinutes} min between posts.`,
        };
      case "day":
        return {
          key: "day",
          text: `This day already has ${clash.count} ${clash.count === 1 ? "post" : "posts"}; the plan allows ${props.schedule.maxPerDay} a day.`,
        };
      default: {
        const unhandled: never = clash;
        return unhandled;
      }
    }
  });
  if (lines.length === 0) return null;
  return (
    <div
      role="status"
      className="text-cc-warn flex flex-col gap-y-1 text-[12px]"
    >
      {lines.map((line) => (
        <span key={line.key}>{line.text}</span>
      ))}
    </div>
  );
}
