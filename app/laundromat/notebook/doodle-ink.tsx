"use client";

import { useId } from "react";
import { useReducedMotion } from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { getInkTimeline } from "@/lib/laundromat/notebook/get-ink-timeline";
import { toLinePath } from "@/lib/laundromat/notebook/to-line-path";
import { toStrokePath } from "@/lib/laundromat/notebook/to-stroke-path";
import { wiggleStroke } from "@/lib/laundromat/notebook/wiggle-stroke";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { CrayonFilter } from "./crayon-filter";
import { useWiggleFrame } from "./use-wiggle-frame";

type DoodleInkProps = {
  strokes: DoodleStroke[];
  strokeWidthPx: number;
  ink: "plain" | "inking" | "waiting";
  replay: SceneConfig["notebook"]["doodle"]["replay"];
  opacity: number;
  onComplete: (() => void) | undefined;
  wiggle: SceneConfig["notebook"]["doodle"]["wiggle"] | undefined;
  crayon: SceneConfig["notebook"]["doodle"]["crayon"];
};

export function DoodleInk(props: DoodleInkProps) {
  const isInking = props.ink === "inking";
  const { quality } = useRenderQuality();
  const crayonFilterId = useId();
  const isCrayon = quality === "full";
  const bodyWidthPx = isCrayon
    ? props.strokeWidthPx * props.crayon.bodyWidthScale
    : undefined;
  const isReducedMotion = useReducedMotion() ?? false;
  const wiggleFrame = useWiggleFrame({
    isEnabled:
      props.wiggle !== undefined &&
      quality === "full" &&
      !isReducedMotion &&
      props.ink !== "waiting",
    fps: props.wiggle?.fps ?? 1,
    frameCount: props.wiggle?.frameCount ?? 1,
  });
  const timeline = getInkTimeline({
    strokes: props.strokes,
    ...props.replay,
  });
  const lastIndex = props.strokes.length - 1;
  const seed = (wiggleFrame ?? 0) + 1;

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
      style={{ opacity: props.ink === "waiting" ? 0 : props.opacity }}
    >
      {isCrayon && (
        <CrayonFilter id={crayonFilterId} crayon={props.crayon} seed={seed} />
      )}
      <g filter={isCrayon ? `url(#${crayonFilterId})` : undefined}>
        {props.strokes.map((drawnStroke, index) => {
          const { delayMs, durationMs } = timeline[index];
          const stroke =
            wiggleFrame === undefined || props.wiggle === undefined
              ? drawnStroke
              : wiggleStroke({
                  stroke: drawnStroke,
                  strokeIndex: index,
                  frame: wiggleFrame,
                  amplitudePx: props.wiggle.amplitudePx,
                });
          const onAnimationEnd =
            isInking && index === lastIndex ? props.onComplete : undefined;
          const [x, y] = stroke.points[0];
          if (stroke.points.length === 1) {
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={(bodyWidthPx ?? props.strokeWidthPx) * 0.7}
                fill="var(--lm-ink-pen)"
                style={
                  isInking
                    ? {
                        opacity: 0,
                        animation: `lm-doodle-dot 1ms linear ${delayMs}ms forwards`,
                      }
                    : undefined
                }
                onAnimationEnd={onAnimationEnd}
              />
            );
          }
          const d =
            wiggleFrame === undefined
              ? toStrokePath(stroke.points)
              : toLinePath(stroke.points);
          const style = isInking
            ? {
                strokeDasharray: "1 2",
                strokeDashoffset: 1,
                opacity: 0,
                animation: `lm-doodle-ink ${durationMs}ms ${props.replay.strokeEasing} ${delayMs}ms forwards`,
              }
            : undefined;
          return (
            <g key={index}>
              {bodyWidthPx !== undefined && (
                <path
                  d={d}
                  pathLength={1}
                  fill="none"
                  stroke="var(--lm-ink-pen)"
                  strokeOpacity={props.crayon.bodyOpacity}
                  strokeWidth={bodyWidthPx}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={style}
                />
              )}
              <path
                d={d}
                pathLength={1}
                fill="none"
                stroke="var(--lm-ink-pen)"
                strokeWidth={props.strokeWidthPx}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={style}
                onAnimationEnd={onAnimationEnd}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
