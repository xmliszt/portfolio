import { StatCell } from "@/app/cc/_ui/stat-cell";
import { StatStrip } from "@/app/cc/_ui/stat-strip";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import type { getCampaignTotals } from "@/lib/cc/get-campaign-totals";
import { PLATFORMS } from "@/lib/cc/platforms";

type TotalsStripProps = {
  postedCount: number;
  plannedCount: number;
  totals: ReturnType<typeof getCampaignTotals>;
};

export function TotalsStrip(props: TotalsStripProps) {
  const totals = props.totals;
  return (
    <StatStrip label="Totals">
      <StatCell
        label="POSTS LIVE"
        value={
          <>
            {String(props.postedCount).padStart(2, "0")}
            <span className="text-muted-foreground text-base">
              /{props.plannedCount}
            </span>
          </>
        }
      />
      <StatCell
        label="VIEWS · 24H"
        tone="accent"
        value={formatMetricNumber(totals.views24h)}
        note={
          totals.bestRatio !== undefined ? (
            <span className="text-cc-ok">
              ▲ best post {totals.bestRatio.ratio.toFixed(1)}× vs{" "}
              {PLATFORMS[totals.bestRatio.platform].shortLabel} median
            </span>
          ) : totals.views24h === undefined ? (
            "No 24 h numbers logged yet"
          ) : (
            "Median needs 2+ posts per platform"
          )
        }
      />
      <StatCell
        label="ENGAGEMENT"
        value={
          totals.engagementRate === undefined
            ? "—"
            : `${(totals.engagementRate * 100).toFixed(1)}%`
        }
        note={
          totals.engagementRate === undefined
            ? "No numbers logged yet"
            : "likes+comments+shares / views"
        }
      />
      <StatCell
        label="PH UPVOTES"
        value={formatMetricNumber(totals.productHuntUpvotes)}
        note={
          totals.productHuntRank !== undefined
            ? `#${totals.productHuntRank} of the day`
            : totals.productHuntUpvotes === undefined
              ? "Logged at +1 h"
              : undefined
        }
      />
      <StatCell
        label="LINK CLICKS"
        value={formatMetricNumber(totals.clicks)}
        note={
          totals.clicks === undefined
            ? "No clicks logged yet"
            : "from logged numbers"
        }
      />
    </StatStrip>
  );
}
