import { type PlatformId,PLATFORMS } from "@/lib/cc/platforms";

type PlatformChipProps = {
  platformId: PlatformId;
};

export function PlatformChip(props: PlatformChipProps) {
  const platform = PLATFORMS[props.platformId];
  return (
    <span
      style={{ color: `hsl(var(${platform.colorVar}))` }}
      className="inline-flex w-fit items-center border border-current px-2 py-0.5 text-[11px] tracking-[0.08em] whitespace-nowrap"
    >
      {platform.shortLabel}
    </span>
  );
}
