"use client";

import { useRef } from "react";
import { useSmoothCorners } from "@lisse/react";

import { cn } from "@/lib/utils";

const IOS_CORNER_RATIO = 0.2237;

type SquircleAppIconProps = {
  src: string;
  sizePx: number;
  className?: string;
};

/** Render an app icon image at `sizePx`, clipped to the iOS home-screen superellipse. */
export function SquircleAppIcon(props: SquircleAppIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  useSmoothCorners(
    ref,
    {
      radius: props.sizePx * IOS_CORNER_RATIO,
      smoothing: 0.6,
      curve: "squircle",
    },
    { autoEffects: false }
  );
  return (
    <div
      className={cn(
        "shrink-0 drop-shadow-[0_1px_2px_rgb(0_0_0/0.18)]",
        props.className
      )}
    >
      <div
        ref={ref}
        style={{ width: props.sizePx, height: props.sizePx }}
        className="overflow-clip rounded-[22.37%]"
      >
        <img
          src={props.src}
          alt=""
          width={props.sizePx}
          height={props.sizePx}
          draggable={false}
          className="m-0 block size-full object-cover"
        />
      </div>
    </div>
  );
}
