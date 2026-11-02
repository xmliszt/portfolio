import { Panel } from "@/app/cc/_ui/panel";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type ViewsByPlatformPanelProps = {
  rows: { platform: PlatformId; views: number }[];
};

export function ViewsByPlatformPanel(props: ViewsByPlatformPanelProps) {
  const maxViews = Math.max(1, ...props.rows.map((row) => row.views));
  return (
    <Panel
      title="VIEWS BY PLATFORM · 24H"
      className="flex-[2_1_420px]"
      bodyClassName="flex flex-col gap-y-3.5 px-3 py-2.5"
    >
      {props.rows.length === 0 ? (
        <p className="text-muted-foreground leading-normal">
          No 24 h views logged yet. Each post fills in after its +24 h log.
        </p>
      ) : (
        props.rows.map((row) => {
          const platform = PLATFORMS[row.platform];
          return (
            <div
              key={row.platform}
              title={`${platform.label}: ${formatMetricNumber(row.views)} views at 24 h`}
              className="grid grid-cols-[80px_minmax(0,1fr)_72px] items-center gap-x-3"
            >
              <span className="text-muted-foreground truncate text-[12px]">
                {platform.shortLabel}
              </span>
              <div className="bg-cc-line-soft h-2.5">
                <div
                  className="h-2.5"
                  style={{
                    width: `${(row.views / maxViews) * 100}%`,
                    backgroundColor: `hsl(var(${platform.colorVar}))`,
                  }}
                />
              </div>
              <span className="text-right font-bold tabular-nums">
                {formatMetricNumber(row.views)}
              </span>
            </div>
          );
        })
      )}
    </Panel>
  );
}
