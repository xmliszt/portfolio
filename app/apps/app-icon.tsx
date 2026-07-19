"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useSmoothCorners } from "@lisse/react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { cn } from "@/app/craft/stations/three-d-rolling-slider/utils";

// iOS app icons use a continuous superellipse whose corner radius is
// ~22.37% of the icon's side. Lisse's `radius` is in pixels, so we track the
// rendered side and feed a proportional radius — keeping the iOS look
// (flat-ish edges) consistent across every size this component renders at.
const IOS_CORNER_RATIO = 0.2237;

export function AppIcon(props: {
  alt: string;
  lightUrl: string;
  darkUrl: string;
  className?: string;
  layoutId?: string;
}) {
  const { resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [sidePx, setSidePx] = useState(0);

  // Track the rendered side so the squircle radius stays proportional across
  // every size this icon renders at. The hook re-applies the clip-path on each
  // render, keeping it in sync as the box resizes.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setSidePx(el.getBoundingClientRect().width);
    const observer = new ResizeObserver(function onResize(entries) {
      const entry = entries.at(0);
      if (entry) setSidePx(entry.contentRect.width);
    });
    observer.observe(el);
    return function cleanup() {
      observer.disconnect();
    };
  }, []);

  // Clip-path only — `autoEffects: false` stops Lisse from extracting the CSS
  // border/shadow into SVG (which needs a wrapper we don't give it, and was
  // mangling the shadow). The shadow lives on the outer wrapper as a
  // `drop-shadow` filter so it traces the squircle silhouette instead of being
  // clipped away like a `box-shadow` would be. `rounded-[25%]` stays as the
  // SSR fallback until the clip-path is applied on the client.
  useSmoothCorners(
    ref,
    { radius: sidePx * IOS_CORNER_RATIO, smoothing: 0.6, curve: "squircle" },
    { autoEffects: false }
  );

  return (
    <motion.div
      layoutId={props.layoutId}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative shrink-0",
        "size-64",
        "drop-shadow-[0_1px_3px_rgb(0_0_0_/_0.12)]",
        props.className
      )}
    >
      <div
        ref={ref}
        className={cn(
          "size-full overflow-clip rounded-[25%]",
          "border-background border-2",
          "border-[0.5px] border-black/10 dark:border-white/10"
        )}
      >
        <img
          src={resolvedTheme === "dark" ? props.darkUrl : props.lightUrl}
          alt={props.alt}
          width={300}
          height={300}
          className="m-0 size-full object-cover p-0"
        />
      </div>
    </motion.div>
  );
}
