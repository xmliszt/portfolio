import { Panel } from "@/app/cc/_ui/panel";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import type { getHashtagLift } from "@/lib/cc/get-hashtag-lift";
import { PLATFORMS } from "@/lib/cc/platforms";

type TopHashtagsPanelProps = {
  lifts: ReturnType<typeof getHashtagLift>;
};

export function TopHashtagsPanel(props: TopHashtagsPanelProps) {
  return (
    <Panel
      title="TOP TAGS · VIEWS/POST"
      bodyClassName="flex flex-col px-3 py-3"
    >
      {props.lifts.length === 0 ? (
        <p className="text-muted-foreground py-1 text-[11px] leading-normal">
          A tag shows here once it is on 3+ posts with 24 h views logged.
        </p>
      ) : (
        props.lifts.slice(0, 5).map((lift) => (
          <div
            key={`${lift.platform}-${lift.tag}`}
            className="flex justify-between gap-x-2 border-b border-dashed py-1.5"
          >
            <span className="truncate">
              #{lift.tag}{" "}
              <span className="text-muted-foreground text-[11px]">
                {PLATFORMS[lift.platform].shortLabel} · {lift.uses} posts
              </span>
            </span>
            <span className="flex gap-x-2">
              <span className="text-primary font-bold tabular-nums">
                {formatMetricNumber(Math.round(lift.meanWith))}
              </span>
              {lift.lift !== undefined && (
                <span className="text-muted-foreground text-[11px]">
                  {lift.lift.toFixed(1)}×
                </span>
              )}
            </span>
          </div>
        ))
      )}
    </Panel>
  );
}
