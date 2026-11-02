import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import type { PlatformId } from "@/lib/cc/platforms";

type PlatformTableProps = {
  rows: {
    platformId: PlatformId;
    postedCount: number;
    plannedCount: number;
    median: number | undefined;
    best: { label: string; views: number } | undefined;
    engagement: number | undefined;
  }[];
};

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function PlatformTable(props: PlatformTableProps) {
  return (
    <Panel
      title="By platform"
      aside="your posts only"
      className="flex-[2_1_420px]"
      footer="Median: +24 h views. Engagement: (likes + comments + shares + saves) ÷ views, at each post's latest entry. “—” until there are numbers."
    >
      {props.rows.length === 0 ? (
        <p className="text-cc-text-2 px-3 py-6">
          No posts in this campaign yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="text-muted-foreground text-[11px] tracking-[0.04em]">
              <tr>
                <th className="px-3 py-1.5 font-normal">PLATFORM</th>
                <th className="px-2 py-1.5 text-right font-normal">POSTED</th>
                <th className="px-2 py-1.5 text-right font-normal">
                  MEDIAN 24H
                </th>
                <th className="px-2 py-1.5 font-normal">BEST POST</th>
                <th className="px-3 py-1.5 text-right font-normal">ENG.</th>
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row) => (
                <tr
                  key={row.platformId}
                  className="border-cc-line-soft border-t"
                >
                  <td className="px-3 py-1.5">
                    <PlatformChip platformId={row.platformId} />
                  </td>
                  <td className="text-cc-text-2 px-2 py-1.5 text-right tabular-nums">
                    {row.postedCount} / {row.plannedCount}
                  </td>
                  <td className="px-2 py-1.5 text-right font-bold tabular-nums">
                    {formatMetricNumber(row.median)}
                  </td>
                  <td className="text-cc-text-2 px-2 py-1.5">
                    {row.best === undefined ? (
                      <span className="text-muted-foreground">—</span>
                    ) : (
                      <span
                        title={row.best.label}
                        className="block max-w-[150px] truncate"
                      >
                        <span className="text-foreground font-bold tabular-nums">
                          {formatMetricNumber(row.best.views)}
                        </span>{" "}
                        {row.best.label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {row.engagement === undefined
                      ? "—"
                      : percentFormatter.format(row.engagement)}
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
