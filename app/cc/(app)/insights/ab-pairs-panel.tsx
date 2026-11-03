import { Panel } from "@/app/cc/_ui/panel";
import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import type { PlatformId } from "@/lib/cc/platforms";

type AbPairsPanelProps = {
  pairs: {
    group: string;
    platformId: PlatformId;
    label: string;
    mineViews: number | undefined;
    chatgptViews: number | undefined;
  }[];
};

function describeResult(options: {
  mineViews: number | undefined;
  chatgptViews: number | undefined;
}) {
  if (options.mineViews === undefined || options.chatgptViews === undefined) {
    return { kind: "waiting" } as const;
  }
  const isChatgptAhead = options.chatgptViews > options.mineViews;
  const [winner, loser] = isChatgptAhead
    ? [options.chatgptViews, options.mineViews]
    : [options.mineViews, options.chatgptViews];
  return {
    kind: "done",
    winner: isChatgptAhead ? "ChatGPT" : "mine",
    lead: loser === 0 ? undefined : Math.round((winner / loser - 1) * 100),
  } as const;
}

export function AbPairsPanel(props: AbPairsPanelProps) {
  return (
    <Panel title="My draft vs ChatGPT edit" aside="+24 h views">
      {props.pairs.length === 0 ? (
        <p className="text-cc-text-2 px-3 py-3 text-[11px] leading-relaxed">
          No A/B pairs yet. In the composer, “Keep both” saves your draft and
          ChatGPT&apos;s edit as a pair; once both are posted and logged at +24
          h, they are compared here.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead className="text-muted-foreground text-[11px] tracking-[0.04em]">
              <tr>
                <th className="px-3 py-2 font-normal">PLATFORM</th>
                <th className="px-2 py-2 font-normal">POST</th>
                <th className="px-2 py-2 text-right font-normal">MINE</th>
                <th className="text-cc-chatgpt px-2 py-2 text-right font-normal">
                  CHATGPT
                </th>
                <th className="px-3 py-2 text-right font-normal">AHEAD</th>
              </tr>
            </thead>
            <tbody>
              {props.pairs.map((pair) => {
                const result = describeResult(pair);
                return (
                  <tr key={pair.group} className="border-cc-line-soft border-t">
                    <td className="px-3 py-2.5">
                      <PlatformChip platformId={pair.platformId} />
                    </td>
                    <td className="text-cc-text-2 px-2 py-2.5">
                      <span
                        title={pair.label}
                        className="block max-w-[240px] truncate"
                      >
                        {pair.label}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {formatMetricNumber(pair.mineViews)}
                    </td>
                    <td className="px-2 py-2.5 text-right tabular-nums">
                      {formatMetricNumber(pair.chatgptViews)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold whitespace-nowrap">
                      {result.kind === "waiting" ? (
                        <span className="text-muted-foreground font-normal">
                          waiting
                        </span>
                      ) : (
                        <span
                          className={
                            result.winner === "ChatGPT"
                              ? "text-cc-chatgpt"
                              : "text-foreground"
                          }
                        >
                          {result.winner}
                          {result.lead === undefined ? "" : ` +${result.lead}%`}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
