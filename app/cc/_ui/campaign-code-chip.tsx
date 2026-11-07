import { getCampaignColorVar } from "@/lib/cc/get-campaign-color-var";
import { cn } from "@/lib/utils";

type CampaignCodeChipProps = {
  code: string;
  color: string;
  className?: string;
};

export function CampaignCodeChip(props: CampaignCodeChipProps) {
  return (
    <span
      style={{
        backgroundColor: `hsl(var(${getCampaignColorVar(props.color)}))`,
      }}
      className={cn(
        "inline-flex h-3.5 min-w-[26px] shrink-0 items-center justify-center px-0.5 text-[9px] leading-none font-bold tracking-[0.04em] text-[hsl(var(--cc-campaign-chip-foreground))]",
        props.className
      )}
    >
      {props.code}
    </span>
  );
}
