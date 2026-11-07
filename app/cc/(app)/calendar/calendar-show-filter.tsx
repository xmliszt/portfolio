import Link from "next/link";

import { CampaignCodeChip } from "@/app/cc/_ui/campaign-code-chip";
import { OtherChip } from "@/app/cc/_ui/other-chip";
import { cn } from "@/lib/utils";

export type CalendarShowOption =
  | {
      kind: "campaign";
      id: string;
      name: string;
      code: string;
      color: string;
      postCount: number;
    }
  | { kind: "other"; id: "other"; postCount: number };

type CalendarShowFilterProps = {
  options: readonly CalendarShowOption[];
  selectedIds: readonly string[];
  /** `all` turns every option on; `toggle` maps each option id to the URL with that option flipped. */
  hrefs: { all: string; toggle: { [optionId: string]: string } };
  hiddenCount: number;
};

const BUTTON_CLASS =
  "flex h-7 items-center gap-x-1.5 px-2.5 text-[11px] tracking-[0.04em] whitespace-nowrap";

export function CalendarShowFilter(props: CalendarShowFilterProps) {
  const allIds = props.options.map((option) => option.id);
  const isAll = props.selectedIds.length === allIds.length;

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <span className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase">
        Show
      </span>
      <div
        role="group"
        aria-label="Show"
        className="bg-border flex flex-wrap gap-x-px gap-y-px border"
      >
        <Link
          href={props.hrefs.all}
          aria-current={isAll ? "true" : undefined}
          className={cn(
            BUTTON_CLASS,
            "bg-card",
            isAll
              ? "text-foreground shadow-[inset_0_-2px_0_hsl(var(--primary))]"
              : "text-muted-foreground hover:text-foreground hover:bg-cc-panel-2"
          )}
        >
          ALL
          <span className="text-muted-foreground text-[10px] tabular-nums">
            {props.options.reduce(
              (total, option) => total + option.postCount,
              0
            )}
          </span>
        </Link>
        {props.options.map((option) => {
          const isOn = props.selectedIds.includes(option.id);
          const isLastOn = isOn && props.selectedIds.length === 1;
          const content = (
            <>
              <span
                aria-hidden
                className={cn(
                  "w-2.5 text-[10px]",
                  isOn ? "text-primary" : "text-transparent"
                )}
              >
                ✓
              </span>
              {option.kind === "campaign" ? (
                <>
                  <CampaignCodeChip code={option.code} color={option.color} />
                  <span className="max-w-[14ch] truncate" title={option.name}>
                    {option.name.toUpperCase()}
                  </span>
                </>
              ) : (
                <>
                  <OtherChip />
                  OTHER
                </>
              )}
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {option.postCount}
              </span>
            </>
          );
          const className = cn(
            BUTTON_CLASS,
            "bg-card",
            isOn ? "text-foreground" : "text-muted-foreground",
            !isLastOn && "hover:text-foreground hover:bg-cc-panel-2"
          );
          return isLastOn ? (
            <span
              key={option.id}
              aria-current="true"
              aria-disabled
              title="At least one filter stays on"
              className={className}
            >
              {content}
            </span>
          ) : (
            <Link
              key={option.id}
              href={props.hrefs.toggle[option.id] ?? props.hrefs.all}
              aria-current={isOn ? "true" : undefined}
              className={className}
            >
              {content}
            </Link>
          );
        })}
      </div>
      {props.hiddenCount > 0 && (
        <span className="text-muted-foreground text-[11px]">
          {props.hiddenCount} hidden
        </span>
      )}
    </div>
  );
}
