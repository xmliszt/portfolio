import { Panel } from "@/app/cc/_ui/panel";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { RESEARCH_SOURCES } from "@/lib/cc/research-sources";
import { RESEARCHED_WINDOWS } from "@/lib/cc/researched-windows";

type HeatLegendPanelProps = {
  platformId: PlatformId;
  source: "own" | "researched";
  isEmpty: boolean;
};

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function HeatLegendPanel(props: HeatLegendPanelProps) {
  const platform = PLATFORMS[props.platformId];
  const research = RESEARCHED_WINDOWS[props.platformId];
  const sources = RESEARCH_SOURCES.filter(
    (source) =>
      source.platform === props.platformId || source.platform === "all"
  );
  return (
    <Panel
      title={`HEAT · ${platform.label}`}
      aside={
        props.source === "own" ? "YOUR VIEWS BY HOUR" : "RESEARCHED WINDOWS"
      }
      className="flex-[1_1_360px]"
      bodyClassName="flex flex-col gap-y-2.5 px-[18px] py-3.5"
    >
      <div className="text-muted-foreground flex items-center gap-x-2.5 text-[11px]">
        LOW
        <div
          className="h-2 flex-1"
          style={{
            backgroundImage: `linear-gradient(90deg, hsl(var(${platform.colorVar}) / 0.02), hsl(var(${platform.colorVar}) / 0.32))`,
          }}
        />
        HIGH
      </div>
      <span className="text-cc-text-2 leading-relaxed">
        {props.isEmpty
          ? `No researched windows for ${platform.label}; heat appears after 10+ posted ${platform.label} items with 24 h views.`
          : props.source === "own"
            ? `Mean 24 h views of your ${platform.label} posts by posting hour (SGT).`
            : `Researched posting windows for ${platform.label} (SGT). After 10+ posted items with 24 h views it switches to your own views by hour.`}
      </span>
      <div className="flex flex-col gap-y-1.5">
        <span className="text-muted-foreground text-[11px] tracking-[0.14em]">
          RESEARCHED DAY WEIGHT
        </span>
        <div className="grid grid-cols-7 gap-x-1 gap-y-1 text-[10px]">
          {research.dayWeights.map((weight, weekday) => (
            <div
              key={WEEKDAYS[weekday]}
              title={`${WEEKDAYS[weekday]} · ${Math.round(weight * 100)}%`}
              className="flex flex-col gap-y-1"
            >
              <div className="bg-cc-panel-2 h-1.5">
                <div
                  className="h-1.5"
                  style={{
                    width: `${weight * 100}%`,
                    backgroundColor: `hsl(var(${platform.colorVar}))`,
                  }}
                />
              </div>
              <span className="text-muted-foreground">{WEEKDAYS[weekday]}</span>
            </div>
          ))}
        </div>
      </div>
      {research.hours.length > 0 && (
        <span className="text-cc-text-2 text-[12px]">
          {research.hours
            .map(
              (window) =>
                `${String(window.startHour % 24).padStart(2, "0")}:00–${String(window.endHour % 24).padStart(2, "0")}:00 ${window.label}`
            )
            .join(" · ")}
        </span>
      )}
      {sources.length > 0 && (
        <div className="flex flex-col gap-y-1.5">
          <span className="text-muted-foreground text-[11px] tracking-[0.14em]">
            WHY THESE WINDOWS · CHECKED {sources.at(0)?.checkedOn}
          </span>
          <ul className="flex flex-col gap-y-1.5 text-[12px]">
            {sources.map((source) => (
              <li
                key={`${source.url}-${source.claim}`}
                className="text-cc-text-2"
              >
                {source.claim}{" "}
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary"
                >
                  {new URL(source.url).hostname.replace(/^www\./, "")} ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  );
}
