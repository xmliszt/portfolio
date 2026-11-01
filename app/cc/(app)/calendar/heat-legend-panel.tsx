import { Panel } from "@/app/cc/_ui/panel";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type HeatLegendPanelProps = {
  platformId: PlatformId;
  source: "own" | "researched";
  isEmpty: boolean;
};

export function HeatLegendPanel(props: HeatLegendPanelProps) {
  const platform = PLATFORMS[props.platformId];
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
    </Panel>
  );
}
