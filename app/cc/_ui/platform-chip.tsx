import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type PlatformChipProps = {
  platformId: PlatformId;
};

export function PlatformChip(props: PlatformChipProps) {
  const platform = PLATFORMS[props.platformId];
  return (
    <span
      style={{
        color: `hsl(var(${platform.colorVar}))`,
        backgroundColor: `hsl(var(${platform.colorVar}) / 0.14)`,
      }}
      className="inline-flex h-5 w-fit items-center px-1.5 text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap"
    >
      {platform.shortLabel}
    </span>
  );
}
