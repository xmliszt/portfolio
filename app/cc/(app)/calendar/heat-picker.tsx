"use client";

import { useRouter } from "next/navigation";

import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type HeatPickerProps = {
  selected: PlatformId;
  hrefs: { platformId: PlatformId; href: string }[];
};

export function HeatPicker(props: HeatPickerProps) {
  const router = useRouter();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const href = props.hrefs.find(
      (item) => item.platformId === event.target.value
    )?.href;
    if (href !== undefined) router.push(href);
  }

  return (
    <div className="flex items-center gap-x-2">
      <label
        htmlFor="heat-platform"
        className="text-muted-foreground text-[10.5px] tracking-[0.04em] uppercase"
      >
        Heat overlay
      </label>
      <select
        id="heat-platform"
        className="cc-input w-auto"
        value={props.selected}
        onChange={handleChange}
        style={{ color: `hsl(var(${PLATFORMS[props.selected].colorVar}))` }}
      >
        {props.hrefs.map((item) => (
          <option key={item.platformId} value={item.platformId}>
            {PLATFORMS[item.platformId].label}
          </option>
        ))}
      </select>
    </div>
  );
}
