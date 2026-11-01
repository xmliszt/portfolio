import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type HourHeatPanelProps = {
  ownGrids: { platformId: PlatformId; cells: (number | undefined)[][] }[];
  progress: { platformId: PlatformId; measured: number }[];
  minPosts: number;
};

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);

export function HourHeatPanel(props: HourHeatPanelProps) {
  return (
    <Panel
      title="Your views by posting hour"
      aside="SGT · mean +24 h views"
      className="flex-[1_1_420px]"
      footer={`Shown per platform after ${props.minPosts} posted items with +24 h views. Until then the calendar uses the researched windows.`}
      bodyClassName="flex flex-col gap-y-5 px-[18px] py-4"
    >
      {props.ownGrids.map((grid) => {
        const maxViews = Math.max(
          1,
          ...grid.cells
            .flat()
            .flatMap((value) => (value === undefined ? [] : [value]))
        );
        return (
          <div key={grid.platformId} className="flex flex-col gap-y-2">
            <PlatformChip platformId={grid.platformId} />
            <div className="overflow-x-auto">
              <div className="text-muted-foreground grid min-w-[480px] grid-cols-[34px_repeat(24,minmax(0,1fr))] gap-x-0.5 gap-y-0.5 text-[10px]">
                <span />
                {HOURS.map((hour) => (
                  <span key={hour} className="text-center">
                    {hour % 3 === 0 ? hour : ""}
                  </span>
                ))}
                {grid.cells.map((day, weekday) => (
                  <div key={WEEKDAYS[weekday]} className="contents">
                    <span>{WEEKDAYS[weekday]}</span>
                    {day.map((views, hour) => (
                      <div
                        key={hour}
                        title={`${WEEKDAYS[weekday]} ${String(hour).padStart(2, "0")}:00 · ${views === undefined ? "no posts" : `${formatMetricNumber(Math.round(views))} views`}`}
                        className="bg-cc-panel-2 h-5"
                      >
                        {views !== undefined && (
                          <div
                            className="bg-primary size-full"
                            style={{
                              opacity: 0.15 + 0.85 * (views / maxViews),
                            }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
      {props.progress.length > 0 && (
        <div className="flex flex-col gap-y-2">
          {props.ownGrids.length === 0 && (
            <p className="text-cc-text-2 leading-relaxed">
              Not enough of your own posts yet. Each platform needs{" "}
              {props.minPosts} posted items with +24 h views before its hours
              mean anything.
            </p>
          )}
          <ul className="flex flex-col gap-y-1.5">
            {props.progress.map((row) => (
              <li
                key={row.platformId}
                className="grid grid-cols-[96px_minmax(0,1fr)_56px] items-center gap-x-3"
              >
                <span className="text-cc-text-2 truncate">
                  {PLATFORMS[row.platformId].label}
                </span>
                <div className="bg-cc-line-soft h-1.5">
                  <div
                    className="bg-primary h-1.5"
                    style={{
                      width: `${Math.min(1, row.measured / props.minPosts) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-muted-foreground text-right tabular-nums">
                  {row.measured} / {props.minPosts}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
