import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import type { PlatformId } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

type HashtagLiftPanelProps = {
  lifts: {
    platform: PlatformId;
    tag: string;
    uses: number;
    lift: number | undefined;
  }[];
  plannedTags: { platform: PlatformId; tag: string; uses: number }[];
};

function formatLift(lift: number) {
  const percent = Math.round((lift - 1) * 100);
  return percent >= 0 ? `+${percent}%` : `−${Math.abs(percent)}%`;
}

export function HashtagLiftPanel(props: HashtagLiftPanelProps) {
  const maxChange = Math.max(
    0.01,
    ...props.lifts.map((row) => Math.abs((row.lift ?? 1) - 1))
  );
  return (
    <Panel
      title="Hashtags · your posts only"
      aside="vs posts without it, same platform"
      className="flex-[1_1_420px]"
      footer="A tag gets a score once 3 posts on one platform use it and have +24 h views. Trending tags would need a paid tool; not in V1."
    >
      {props.lifts.length === 0 ? (
        <div className="flex flex-col gap-y-3 px-3 py-3">
          <p className="text-cc-text-2 leading-relaxed">
            No tag has 3 measured uses yet, so there is nothing to compare.
          </p>
          {props.plannedTags.length === 0 ? (
            <p className="text-muted-foreground">
              No tag repeats on one platform in this campaign yet.
            </p>
          ) : (
            <div className="flex flex-col gap-y-1.5">
              <span className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase">
                REPEATED IN THIS CAMPAIGN
              </span>
              <ul className="flex flex-wrap gap-x-2 gap-y-2">
                {props.plannedTags.map((row) => (
                  <li
                    key={`${row.platform}-${row.tag}`}
                    className="bg-cc-panel-2 flex items-center gap-x-2 border px-2 py-1"
                  >
                    <PlatformChip platformId={row.platform} />
                    <span>#{row.tag}</span>
                    <span className="text-muted-foreground">×{row.uses}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <ul>
          {props.lifts.map((row) => {
            const change = (row.lift ?? 1) - 1;
            return (
              <li
                key={`${row.platform}-${row.tag}`}
                className="border-cc-line-soft grid grid-cols-[minmax(0,1.4fr)_auto_44px_minmax(0,1fr)_64px] items-center gap-x-3 border-t px-3 py-2.5 first:border-t-0"
              >
                <span className="truncate">#{row.tag}</span>
                <PlatformChip platformId={row.platform} />
                <span className="text-muted-foreground">×{row.uses}</span>
                <div className="bg-cc-line-soft h-2">
                  <div
                    className={cn(
                      "h-2",
                      change >= 0 ? "bg-cc-ok" : "bg-cc-warn"
                    )}
                    style={{
                      width: `${(Math.abs(change) / maxChange) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-right font-bold tabular-nums">
                  {row.lift === undefined ? "—" : formatLift(row.lift)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
