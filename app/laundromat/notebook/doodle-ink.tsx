"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { getInkTimeline } from "@/lib/laundromat/notebook/get-ink-timeline";
import { getWiggleFrameAnimation } from "@/lib/laundromat/notebook/get-wiggle-frame-animation";
import { toLinePath } from "@/lib/laundromat/notebook/to-line-path";
import { toStrokePath } from "@/lib/laundromat/notebook/to-stroke-path";
import { wiggleStroke } from "@/lib/laundromat/notebook/wiggle-stroke";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { CrayonFilter } from "./crayon-filter";
import { CRAYON_FILTER_MARGIN } from "./crayon-filter-margin";

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
  const { quality } = useRenderQuality();
  const crayonFilterId = useId();
  const isCrayon = quality === "full";
  const isReducedMotion = useReducedMotion() ?? false;
  const wiggle =
    props.wiggle !== undefined && isCrayon && !isReducedMotion
      ? props.wiggle
      : undefined;
  const cyclingWiggle = props.ink === "plain" ? wiggle : undefined;
  const boxRef = useRef<HTMLDivElement>(null);
  const frameSourcesRef = useRef<HTMLDivElement>(null);
  const [frameMasks, setFrameMasks] = useState<string[]>();

  // Safari reruns the crayon filter on every repaint, so each wiggle frame is
  // drawn once into a mask image and the frames take turns through CSS.
  useEffect(() => {
    const box = boxRef.current;
    const frameSources = frameSourcesRef.current;
    if (cyclingWiggle === undefined || box === null || frameSources === null)
      return;
    setFrameMasks(
      Array.from(frameSources.children, (svg) =>
        toMaskImage({
          svg,
          widthPx: box.clientWidth,
          heightPx: box.clientHeight,
        })
      )
    );
  }, [cyclingWiggle, props.strokes, props.strokeWidthPx, props.crayon]);

  const frameProps = {
    strokes: props.strokes,
    strokeWidthPx: props.strokeWidthPx,
    replay: props.replay,
    crayon: props.crayon,
    isCrayon,
  };

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ opacity: props.ink === "waiting" ? 0 : props.opacity }}
    >
      {cyclingWiggle !== undefined && frameMasks !== undefined ? (
        frameMasks.map((maskImage, frame) => (
          <div
            key={frame}
            className="absolute bg-[var(--lm-ink-pen)]"
            style={{
              inset: `-${CRAYON_FILTER_MARGIN * 100}%`,
              maskImage,
              maskSize: "100% 100%",
              WebkitMaskImage: maskImage,
              WebkitMaskSize: "100% 100%",
              opacity: 0,
              animation: getWiggleFrameAnimation({
                frame,
                frameCount: cyclingWiggle.frameCount,
                fps: cyclingWiggle.fps,
              }),
            }}
          />
        ))
      ) : (
        <DoodleFrame
          {...frameProps}
          isInking={props.ink === "inking"}
          onComplete={props.onComplete}
          wiggle={
            wiggle === undefined
              ? undefined
              : { frame: 0, amplitudePx: wiggle.amplitudePx }
          }
          crayonFilterId={crayonFilterId}
          inkColor="var(--lm-ink-pen)"
        />
      )}
      {cyclingWiggle !== undefined && (
        <div ref={frameSourcesRef} className="hidden">
          {Array.from({ length: cyclingWiggle.frameCount }, (_, frame) => (
            <DoodleFrame
              key={frame}
              {...frameProps}
              isInking={false}
              onComplete={undefined}
              wiggle={{ frame, amplitudePx: cyclingWiggle.amplitudePx }}
              crayonFilterId={`${crayonFilterId}-${frame}`}
              inkColor="black"
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** Return a CSS `url()` of the children of `svg` as a standalone SVG image of `widthPx` by `heightPx` plus `CRAYON_FILTER_MARGIN` on each side, without changing `svg`. */
function toMaskImage(options: {
  svg: Element;
  widthPx: number;
  heightPx: number;
}) {
  const marginXPx = options.widthPx * CRAYON_FILTER_MARGIN;
  const marginYPx = options.heightPx * CRAYON_FILTER_MARGIN;
  const outerWidthPx = options.widthPx + marginXPx * 2;
  const outerHeightPx = options.heightPx + marginYPx * 2;
  const serializer = new XMLSerializer();
  const content = Array.from(options.svg.children, (child) =>
    serializer.serializeToString(child)
  ).join("");
  const markup = `<svg xmlns="http://www.w3.org/2000/svg" width="${outerWidthPx}" height="${outerHeightPx}" viewBox="${-marginXPx} ${-marginYPx} ${outerWidthPx} ${outerHeightPx}"><svg width="${options.widthPx}" height="${options.heightPx}" overflow="visible">${content}</svg></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(markup)}")`;
}

type DoodleFrameProps = {
  strokes: DoodleStroke[];
  strokeWidthPx: number;
  isInking: boolean;
  replay: SceneConfig["notebook"]["doodle"]["replay"];
  onComplete: (() => void) | undefined;
  wiggle: { frame: number; amplitudePx: number } | undefined;
  crayon: SceneConfig["notebook"]["doodle"]["crayon"];
  isCrayon: boolean;
  crayonFilterId: string;
  inkColor: string;
};

function DoodleFrame(props: DoodleFrameProps) {
  const bodyWidthPx = props.isCrayon
    ? props.strokeWidthPx * props.crayon.bodyWidthScale
    : undefined;
  const timeline = getInkTimeline({
    strokes: props.strokes,
    ...props.replay,
  });
  const lastIndex = props.strokes.length - 1;
  const seed = (props.wiggle?.frame ?? 0) + 1;

  return (
    <svg className="absolute inset-0 size-full overflow-visible">
      {props.isCrayon && (
        <CrayonFilter
          id={props.crayonFilterId}
          crayon={props.crayon}
          seed={seed}
        />
      )}
      <g filter={props.isCrayon ? `url(#${props.crayonFilterId})` : undefined}>
        {props.strokes.map((drawnStroke, index) => {
          const { delayMs, durationMs } = timeline[index];
          const stroke =
            props.wiggle === undefined
              ? drawnStroke
              : wiggleStroke({
                  stroke: drawnStroke,
                  strokeIndex: index,
                  frame: props.wiggle.frame,
                  amplitudePx: props.wiggle.amplitudePx,
                });
          const onAnimationEnd =
            props.isInking && index === lastIndex
              ? props.onComplete
              : undefined;
          const [x, y] = stroke.points[0];
          if (stroke.points.length === 1) {
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r={(bodyWidthPx ?? props.strokeWidthPx) * 0.7}
                fill={props.inkColor}
                style={
                  props.isInking
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
            props.wiggle === undefined
              ? toStrokePath(stroke.points)
              : toLinePath(stroke.points);
          const style = props.isInking
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
                  stroke={props.inkColor}
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
                stroke={props.inkColor}
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
