import { Panel } from "@/app/cc/_ui/panel";
import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import { getMetricLabel } from "@/lib/cc/get-metric-label";
import { listMetricLabels } from "@/lib/cc/list-metric-labels";
import { parseMetricLine } from "@/lib/cc/parse-metric-line";
import { PLATFORM_IDS, type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type TelegramReplyMockProps = {
  platformId: PlatformId;
  telegramLinked: boolean;
};

const EXAMPLE_TOKENS = [
  "7.9k",
  "512",
  "260",
  "41",
  "22",
  "9",
  "6",
  "5",
  "3",
  "2",
];

export function TelegramReplyMock(props: TelegramReplyMockProps) {
  const platform = PLATFORMS[props.platformId];
  const reply = EXAMPLE_TOKENS.slice(0, platform.metrics.length).join(" ");
  const parsed = parseMetricLine({ line: reply, fields: platform.metrics });
  const summary =
    parsed.kind === "ok"
      ? platform.metrics
          .map(
            (field) =>
              `${getMetricLabel({ platformId: props.platformId, field })} ${formatMetricNumber(parsed.values[field])}`
          )
          .join(" · ")
      : "";

  return (
    <Panel
      title="1 · Reply on Telegram"
      aside={
        props.telegramLinked ? (
          <span className="text-cc-ok">FASTEST</span>
        ) : (
          <span className="text-cc-warn">BOT NOT SET UP</span>
        )
      }
      className="flex-[1_1_340px] lg:max-w-[440px]"
      footer={
        <div className="flex flex-col gap-y-2 leading-relaxed">
          <span>
            One line, numbers in this order, spaces between. “-” skips a field.
            Takes 1.2k, 1,240 and 1.2万.
          </span>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            {PLATFORM_IDS.map((platformId) => (
              <div key={platformId} className="contents">
                <dt className="text-cc-text-2">
                  {PLATFORMS[platformId].label}
                </dt>
                <dd>{listMetricLabels({ platformId }).join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </div>
      }
    >
      <div
        aria-label="Example chat"
        className="bg-background/60 flex flex-col gap-y-3 p-4 text-[12px] leading-relaxed"
      >
        <div className="bg-cc-panel-2 max-w-[85%] self-start border px-3 py-2.5">
          <span className="text-primary">CC bot</span>
          <br />
          📊 Log numbers · +24h · {platform.label}
          <br />
          Reply with:
          <br />
          <span className="text-cc-warn">
            {listMetricLabels({ platformId: props.platformId }).join(" · ")}
          </span>
        </div>
        <div className="border-primary bg-primary/15 max-w-[85%] self-end border px-3 py-2.5 text-[15px] font-bold">
          {reply}
        </div>
        <div className="bg-cc-panel-2 max-w-[85%] self-start border px-3 py-2.5">
          <span className="text-primary">CC bot</span>
          <br />
          Logged ✓ {summary} · 2.5× your {platform.label} median
          <br />
          <span className="text-muted-foreground">Wrong? Reply “undo”.</span>
        </div>
        <span className="text-muted-foreground text-[11px]">
          EXAMPLE NUMBERS
        </span>
      </div>
    </Panel>
  );
}
