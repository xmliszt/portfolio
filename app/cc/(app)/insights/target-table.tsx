import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import type { getTargetStats } from "@/lib/cc/get-target-stats";

type TargetTableProps = {
  rows: ReturnType<typeof getTargetStats>;
};

export function TargetTable(props: TargetTableProps) {
  return (
    <Panel
      title="By subreddit, topic or community"
      aside="posted only"
      className="flex-[2_1_420px]"
      footer="Set the subreddit, Threads topic or community in the Composer. Median and best: +24 h views."
    >
      {props.rows.length === 0 ? (
        <p className="text-cc-text-2 px-[18px] py-6">
          No posted subreddits, topics or communities yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead className="text-muted-foreground text-[11px] tracking-[0.1em]">
              <tr>
                <th className="px-[18px] py-2 font-normal">WHERE</th>
                <th className="px-2 py-2 text-right font-normal">POSTED</th>
                <th className="px-2 py-2 text-right font-normal">MEDIAN 24H</th>
                <th className="px-[18px] py-2 text-right font-normal">BEST</th>
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row) => (
                <tr
                  key={`${row.platform}-${row.target}`}
                  className="border-cc-line-soft border-t"
                >
                  <td className="px-[18px] py-2.5">
                    <span className="flex items-center gap-x-2">
                      <PlatformChip platformId={row.platform} />
                      <span className="text-cc-text-2 truncate">
                        {row.target}
                      </span>
                    </span>
                  </td>
                  <td className="text-cc-text-2 px-2 py-2.5 text-right tabular-nums">
                    {row.posted}
                  </td>
                  <td className="px-2 py-2.5 text-right font-bold tabular-nums">
                    {formatMetricNumber(row.median)}
                  </td>
                  <td className="px-[18px] py-2.5 text-right tabular-nums">
                    {formatMetricNumber(row.best)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
