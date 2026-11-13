"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { cn } from "@/lib/utils";

const HEART_PATH =
  "M12 20.3s-7.4-4.5-9.2-9C1.5 8 3.4 4.6 6.8 4.6c2.1 0 3.7 1.2 5.2 3.1 1.5-1.9 3.1-3.1 5.2-3.1 3.4 0 5.3 3.4 4 6.7-1.8 4.5-9.2 9-9.2 9z";

const BURST_HEARTS = Array.from({ length: 7 }, (_, index) => {
  const angle = -Math.PI / 2 + (index / 7) * Math.PI * 2;
  const distancePx = index % 2 === 0 ? 15 : 12;
  return {
    xPx: Math.cos(angle) * distancePx,
    yPx: Math.sin(angle) * distancePx,
    sizePx: index % 2 === 0 ? 6 : 5,
    delayS: (index % 3) * 0.02,
  };
});

type LoveButtonProps = {
  loved: boolean;
  count: number;
  label: string;
  onToggle: () => void;
};

export function LoveButton(props: LoveButtonProps) {
  const { quality } = useRenderQuality();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [burstKey, setBurstKey] = useState(0);
  const isAnimated = !prefersReducedMotion && burstKey > 0;

  function handleClick() {
    if (!props.loved) setBurstKey((key) => key + 1);
    props.onToggle();
  }

  return (
    <button
      type="button"
      aria-pressed={props.loved}
      aria-label={props.label}
      onClick={handleClick}
      className={cn(
        "-ml-1 flex cursor-pointer items-center gap-x-1.5 rounded-md px-1 py-0.5 outline-none focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]",
        props.loved
          ? "text-[var(--lm-accent)]"
          : "text-[var(--lm-ink)] hover:text-[var(--lm-ink-hi)]"
      )}
    >
      <span className="relative grid size-[18px] place-items-center">
        {isAnimated && props.loved && quality === "full" && (
          <span
            key={`burst-${burstKey}`}
            aria-hidden
            className="pointer-events-none"
          >
            <motion.span
              className="absolute inset-0 rounded-full border border-[var(--lm-accent)]"
              initial={{ scale: 0.4, opacity: 0.7 }}
              animate={{ scale: 1.7, opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
            {BURST_HEARTS.map((heart, index) => (
              <motion.svg
                key={index}
                viewBox="0 0 24 24"
                className="absolute top-1/2 left-1/2 fill-[var(--lm-accent)]"
                style={{
                  width: heart.sizePx,
                  height: heart.sizePx,
                  marginLeft: -heart.sizePx / 2,
                  marginTop: -heart.sizePx / 2,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{
                  x: heart.xPx,
                  y: heart.yPx,
                  scale: [0, 1.2, 0.8],
                  opacity: [1, 1, 0],
                }}
                transition={{
                  duration: 0.6,
                  delay: 0.06 + heart.delayS,
                  ease: [0.2, 0.8, 0.3, 1],
                }}
              >
                <path d={HEART_PATH} />
              </motion.svg>
            ))}
          </span>
        )}
        <motion.svg
          key={isAnimated ? `heart-${burstKey}` : "heart"}
          aria-hidden
          viewBox="0 0 24 24"
          className="relative size-[18px] stroke-current stroke-[1.6]"
          initial={isAnimated && props.loved ? { scale: 0.55 } : false}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 520, damping: 11 }}
        >
          <path
            d={HEART_PATH}
            className={cn(
              "transition-[fill] duration-150 motion-reduce:transition-none",
              props.loved ? "fill-current" : "fill-transparent"
            )}
            strokeLinejoin="round"
          />
        </motion.svg>
      </span>
      <span className="text-[12px] tabular-nums">{props.count}</span>
    </button>
  );
}
