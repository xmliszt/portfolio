import type { PlatformId } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

type CharacterCountProps = {
  count: number;
  limit: number | undefined;
  platformId: PlatformId;
  showRule?: boolean;
};

export function CharacterCount(props: CharacterCountProps) {
  const limit = props.limit;
  return (
    <div className="flex flex-col items-end gap-y-0.5 text-right">
      <span
        aria-live="polite"
        className={cn(
          "font-bold tabular-nums",
          limit === undefined
            ? "text-muted-foreground"
            : props.count > limit
              ? "text-destructive"
              : props.count >= limit * 0.9
                ? "text-cc-warn"
                : "text-cc-ok"
        )}
      >
        {props.count.toLocaleString("en-US")}
        {limit === undefined
          ? " · no limit"
          : ` / ${limit.toLocaleString("en-US")}`}
      </span>
      {props.showRule === true && (
        <span className="text-muted-foreground text-[11px]">
          {props.platformId === "x"
            ? "X counts a link as 23 and an emoji as 2."
            : "Each character counts as 1, emoji included."}
        </span>
      )}
    </div>
  );
}
