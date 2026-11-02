import { cn } from "@/lib/utils";

export type PostStatusTone =
  | "posted"
  | "scheduled"
  | "next"
  | "due"
  | "failed"
  | "draft"
  | "skipped";

type StatusDotProps = {
  tone: PostStatusTone;
  label?: string;
};

const TONE_CLASS = {
  posted: "text-cc-ok",
  scheduled: "text-cc-text-2",
  next: "text-primary",
  due: "text-cc-warn",
  failed: "text-cc-danger",
  draft: "text-muted-foreground",
  skipped: "text-muted-foreground line-through",
} as const satisfies { [tone in PostStatusTone]: string };

export function StatusDot(props: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-1.5 text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase",
        TONE_CLASS[props.tone]
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {props.label ?? props.tone}
    </span>
  );
}
