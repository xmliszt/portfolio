import Link from "next/link";

import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";
import { cn } from "@/lib/utils";

type HeatPickerProps = {
  selected: PlatformId;
  hrefs: { platformId: PlatformId; href: string }[];
};

export function HeatPicker(props: HeatPickerProps) {
  return (
    <nav
      aria-label="Heat overlay platform"
      className="flex flex-wrap items-center gap-x-2 gap-y-2"
    >
      <span className="text-muted-foreground mr-1 text-[11px] tracking-[0.14em]">
        HEAT OVERLAY
      </span>
      {props.hrefs.map((item) => {
        const platformId = item.platformId;
        const platform = PLATFORMS[platformId];
        const isSelected = platformId === props.selected;
        return (
          <Link
            key={platformId}
            href={item.href}
            aria-current={isSelected ? "true" : undefined}
            className={cn(
              "flex min-h-11 items-center border px-3 text-[11px] tracking-[0.08em]",
              isSelected
                ? "border-current"
                : "text-muted-foreground hover:text-foreground"
            )}
            style={
              isSelected
                ? {
                    color: `hsl(var(${platform.colorVar}))`,
                    backgroundColor: `hsl(var(${platform.colorVar}) / 0.12)`,
                  }
                : undefined
            }
          >
            {platform.shortLabel}
            {isSelected && " ✓"}
          </Link>
        );
      })}
    </nav>
  );
}
