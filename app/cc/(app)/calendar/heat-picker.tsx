"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CcSelect } from "@/app/cc/_ui/cc-select";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type HeatPickerProps = {
  selected: PlatformId;
  hrefs: { platformId: PlatformId; href: string }[];
};

export function HeatPicker(props: HeatPickerProps) {
  const router = useRouter();
  const [value, setValue] = useState(props.selected);
  const [lastSelected, setLastSelected] = useState(props.selected);
  if (props.selected !== lastSelected) {
    setLastSelected(props.selected);
    setValue(props.selected);
  }

  function handleChange(platformId: PlatformId) {
    setValue(platformId);
    const href = props.hrefs.find(
      (item) => item.platformId === platformId
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
      <CcSelect
        id="heat-platform"
        className="w-[160px]"
        value={value}
        onChange={handleChange}
        style={{ color: `hsl(var(${PLATFORMS[value].colorVar}))` }}
        options={props.hrefs.map((item) => ({
          value: item.platformId,
          label: PLATFORMS[item.platformId].label,
        }))}
      />
    </div>
  );
}
