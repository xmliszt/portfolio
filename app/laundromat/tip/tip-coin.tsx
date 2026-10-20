"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { TipCoinMetal } from "@/lib/laundromat/tip/tip-coin-metals";
import { cn } from "@/lib/utils";

import { TipCoinBlank } from "./tip-coin-blank";

const TILT_DEG = 14;
const LABEL_FONT_SIZES = [40, 40, 32, 26];
const LABEL_MAX_WIDTH = 58;

type TipCoinProps = {
  metal: TipCoinMetal;
  label: string;
  caption?: string;
  sizePx: number;
  engraved?: boolean;
  shine?: boolean;
  dim?: boolean;
  flat?: boolean;
  className?: string;
};

/** Draw a struck metal coin with a small `caption` above a stamped `label`, the rim text when `engraved`, its edge and shadow unless `flat`, and on full quality without reduced motion a sheen and tilt that follow the mouse while `shine`. */
export function TipCoin(props: TipCoinProps) {
  const { quality } = useRenderQuality();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isLive =
    props.shine === true && quality === "full" && !prefersReducedMotion;
  const coinRef = useRef<HTMLSpanElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLSpanElement>) {
    const coin = coinRef.current;
    if (!isLive || coin === null || event.pointerType !== "mouse") return;
    const bounds = coin.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    coin.style.setProperty("--sheen-x", `${x * 100}%`);
    coin.style.setProperty("--tilt-x", `${(0.5 - y) * TILT_DEG}deg`);
    coin.style.setProperty("--tilt-y", `${(x - 0.5) * TILT_DEG}deg`);
  }

  function handlePointerLeave() {
    const coin = coinRef.current;
    if (coin === null) return;
    coin.style.removeProperty("--sheen-x");
    coin.style.removeProperty("--tilt-x");
    coin.style.removeProperty("--tilt-y");
  }

  return (
    <span
      aria-hidden
      className={cn("inline-block [perspective:400px]", props.className)}
      style={{ width: props.sizePx, height: props.sizePx }}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <TipCoinBlank
        ref={coinRef}
        metal={props.metal}
        sizePx={props.sizePx}
        engraved={props.engraved === true}
        sheen={isLive ? "follow" : "static"}
        raised={props.flat !== true}
        dim={props.dim}
        className="[transform:rotateX(var(--tilt-x,0deg))_rotateY(var(--tilt-y,0deg))] transition-[transform,filter] duration-300 ease-out"
      >
        {({ field }) => (
          <g
            className="font-[family-name:var(--lm-font-display)]"
            textAnchor="middle"
          >
            {props.caption !== undefined && (
              <text
                x={50}
                y={34}
                fontSize={11}
                fill={field.dark}
                stroke={field.light}
                strokeWidth={0.4}
                paintOrder="stroke"
              >
                {props.caption}
              </text>
            )}
            {[
              { dy: 1.2, fill: field.light, opacity: 0.85 },
              { dy: 0, fill: field.edge, opacity: 0.9 },
            ].map((layer) => (
              <text
                key={layer.dy}
                x={50}
                y={(props.caption === undefined ? 62 : 68) + layer.dy}
                fontSize={LABEL_FONT_SIZES[Math.min(props.label.length, 3)]}
                textLength={
                  props.label.length > 3 ? LABEL_MAX_WIDTH : undefined
                }
                lengthAdjust="spacingAndGlyphs"
                fontWeight={600}
                fill={layer.fill}
                opacity={layer.opacity}
              >
                {props.label}
              </text>
            ))}
          </g>
        )}
      </TipCoinBlank>
    </span>
  );
}
