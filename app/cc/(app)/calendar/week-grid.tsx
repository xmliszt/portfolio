import Link from "next/link";

import type { getHourHeat } from "@/lib/cc/get-hour-heat";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

export type GridPost = {
  id: string;
  platformId: PlatformId;
  day: string;
  hour: number;
  timeLabel: string;
  label: string;
  status: string;
  project: string | undefined;
  childNote: string | undefined;
  href: string;
  isSelected: boolean;
};

type WeekGridProps = {
  days: { date: string; label: string; isToday: boolean }[];
  hours: number[];
  posts: GridPost[];
  heat: ReturnType<typeof getHourHeat>;
  heatPlatformId: PlatformId;
};

const MAX_HEAT_ALPHA = 0.18;

function getHeatAlpha(options: {
  heat: WeekGridProps["heat"];
  weekday: number;
  hour: number;
  maxOwnViews: number;
}) {
  const value = options.heat.cells.at(options.weekday)?.at(options.hour);
  if (value === undefined || value === 0) return 0;
  return options.heat.kind === "own"
    ? (value / options.maxOwnViews) * MAX_HEAT_ALPHA
    : value * MAX_HEAT_ALPHA;
}

export function WeekGrid(props: WeekGridProps) {
  const colorVar = PLATFORMS[props.heatPlatformId].colorVar;
  const maxOwnViews = Math.max(
    1,
    ...props.heat.cells.flat().map((value) => value ?? 0)
  );

  return (
    <div className="overflow-x-auto border">
      <div className="bg-card grid min-w-[980px] grid-cols-[56px_repeat(7,minmax(0,1fr))]">
        <div className="border-b" />
        {props.days.map((day) => (
          <div
            key={day.date}
            className={cn(
              "flex justify-between border-b border-l px-2 py-1.5 text-[11px] font-semibold tracking-[0.04em]",
              day.isToday ? "text-primary" : "text-muted-foreground"
            )}
          >
            {day.label}
          </div>
        ))}
        {props.hours.map((hour) => (
          <div key={hour} className="contents">
            <div className="text-muted-foreground border-cc-line-soft border-b px-2 py-1 text-[10.5px] tabular-nums">
              {String(hour).padStart(2, "0")}:00
            </div>
            {props.days.map((day, weekday) => {
              const alpha = getHeatAlpha({
                heat: props.heat,
                weekday,
                hour,
                maxOwnViews,
              });
              const cellPosts = props.posts.filter(
                (post) => post.day === day.date && post.hour === hour
              );
              return (
                <div
                  key={day.date}
                  className="border-cc-line-soft flex min-h-8 flex-col gap-y-0.5 border-b border-l p-0.5"
                  style={
                    alpha > 0
                      ? { backgroundColor: `hsl(var(${colorVar}) / ${alpha})` }
                      : undefined
                  }
                >
                  {cellPosts.map((post) => {
                    const platform = PLATFORMS[post.platformId];
                    return (
                      <Link
                        key={post.id}
                        href={post.href}
                        aria-current={post.isSelected ? "true" : undefined}
                        className={cn(
                          "bg-card hover:bg-cc-panel-2 flex flex-col border-l-2 px-1.5 py-0.5",
                          post.isSelected &&
                            "outline-primary outline outline-1",
                          post.status === "skipped" && "opacity-50"
                        )}
                        style={{
                          borderLeftColor: `hsl(var(${platform.colorVar}))`,
                        }}
                      >
                        <span
                          className="flex justify-between gap-x-1 text-[10px] tracking-[0.04em]"
                          style={{ color: `hsl(var(${platform.colorVar}))` }}
                        >
                          <span className="flex min-w-0 items-center gap-x-1">
                            <span className="truncate">
                              {post.timeLabel} {platform.shortLabel}
                            </span>
                            {post.project !== undefined && (
                              <span className="border-cc-text-2 text-cc-text-2 shrink-0 border px-0.5 text-[9px] leading-[12px] font-semibold">
                                CUSTOM
                              </span>
                            )}
                          </span>
                          {post.status !== "scheduled" && (
                            <span
                              className={
                                post.status === "posted"
                                  ? "text-cc-ok"
                                  : "text-muted-foreground"
                              }
                            >
                              {post.status === "posted"
                                ? "✓"
                                : post.status.toUpperCase()}
                            </span>
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-cc-text-2 truncate text-[11px]",
                            post.status === "skipped" && "line-through"
                          )}
                        >
                          {post.project !== undefined && (
                            <span className="text-foreground font-semibold">
                              {post.project} ·{" "}
                            </span>
                          )}
                          {post.label}
                          {post.childNote !== undefined && (
                            <span className="text-muted-foreground">
                              {" "}
                              {post.childNote}
                            </span>
                          )}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
