import type { TagUsageRating } from "@/lib/cc/rate-tag-usage";
import { cn } from "@/lib/utils";

type TagRatingBadgeProps = {
  rating: TagUsageRating;
};

const RATINGS = {
  quiet: {
    label: "TOO QUIET",
    hint: "Almost nobody uses it, so it won't bring anyone in.",
    className: "border-border text-muted-foreground",
  },
  good: {
    label: "GOOD FIT",
    hint: "Used steadily but not flooded, so your post stays visible.",
    className: "border-cc-ok text-cc-ok",
  },
  busy: {
    label: "BUSY",
    hint: "Lots of posts; yours may scroll away within hours.",
    className: "border-cc-warn text-cc-warn",
  },
  crowded: {
    label: "CROWDED",
    hint: "Thousands of posts a day; yours gets buried in seconds.",
    className: "border-cc-warn bg-cc-warn/10 text-cc-warn",
  },
} as const satisfies {
  [rating in TagUsageRating]: {
    label: string;
    hint: string;
    className: string;
  };
};

export function TagRatingBadge(props: TagRatingBadgeProps) {
  const rating = RATINGS[props.rating];
  return (
    <span
      title={rating.hint}
      className={cn(
        "inline-flex shrink-0 items-center border px-1.5 text-[10px] font-bold tracking-[0.04em]",
        rating.className
      )}
    >
      {rating.label}
    </span>
  );
}
