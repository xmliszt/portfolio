"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useId, useRef } from "react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { getStrokeLength } from "@/lib/laundromat/notebook/get-stroke-length";
import { simplifyStroke } from "@/lib/laundromat/notebook/simplify-stroke";
import { toStrokePath } from "@/lib/laundromat/notebook/to-stroke-path";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { CrayonFilter } from "./crayon-filter";

const DOT_TRAVEL_PX = 1.5;
const SCRATCH_STEP_PX = 12;
const SCRATCH_MIN_GAP_MS = 40;
const SCRATCH_VOLUME = { min: 0.35, max: 1, perPxPerMs: 0.4 };

type ActiveStroke = {
  pointerId: number;
  points: [number, number][];
  startedAt: number;
  scratch: { travelPx: number; atMs: number };
};

type DoodlePadProps = {
  label: string;
  widthPx: number;
  heightPx: number;
  strokeWidthPx: number;
  smoothing: number;
  simplifyPx: number;
  crayon: SceneConfig["notebook"]["doodle"]["crayon"];
  disabled: boolean;
  onStrokeStart: () => void;
  onStrokeCancel: () => void;
  onStroke: (stroke: DoodleStroke) => void;
  onScratch: (volume: number) => void;
};

function roundToHalf(points: [number, number][]) {
  return points.map(
    ([x, y]) =>
      [Math.round(x * 2) / 2, Math.round(y * 2) / 2] satisfies [number, number]
  );
}

/** Draw the stroke under the pointer live and hand each finished stroke, smoothed and simplified, to `onStroke`; a second finger cancels the stroke in progress. */
export function DoodlePad(props: DoodlePadProps) {
  const padRef = useRef<HTMLDivElement>(null);
  const livePathRef = useRef<SVGPathElement>(null);
  const liveBodyRef = useRef<SVGPathElement>(null);
  const crayonFilterId = useId();
  const isCrayon = useRenderQuality().quality === "full";
  const activeRef = useRef<ActiveStroke>(undefined);

  function setLivePath(d: string) {
    livePathRef.current?.setAttribute("d", d);
    liveBodyRef.current?.setAttribute("d", d);
  }

  function toPadPoint(event: {
    clientX: number;
    clientY: number;
  }): [number, number] {
    const rect = padRef.current?.getBoundingClientRect();
    if (rect === undefined || rect.width === 0) return [0, 0];
    const ratio = props.widthPx / rect.width;
    return [
      Math.max(0, Math.min(props.widthPx, (event.clientX - rect.left) * ratio)),
      Math.max(0, Math.min(props.heightPx, (event.clientY - rect.top) * ratio)),
    ];
  }

  function clearLiveStroke() {
    activeRef.current = undefined;
    setLivePath("");
  }

  function cancelStroke() {
    if (activeRef.current === undefined) return;
    clearLiveStroke();
    props.onStrokeCancel();
  }

  useEffect(() => {
    if (!props.disabled) return;
    activeRef.current = undefined;
    setLivePath("");
  }, [props.disabled]);

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (props.disabled) return;
    event.stopPropagation();
    if (activeRef.current !== undefined) {
      cancelStroke();
      return;
    }
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = toPadPoint(event);
    const now = performance.now();
    activeRef.current = {
      pointerId: event.pointerId,
      points: [point],
      startedAt: now,
      scratch: { travelPx: 0, atMs: now },
    };
    setLivePath(toStrokePath([point, point]));
    props.onStrokeStart();
    props.onScratch(SCRATCH_VOLUME.min);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const active = activeRef.current;
    if (active === undefined || active.pointerId !== event.pointerId) return;
    const samples = event.nativeEvent.getCoalescedEvents?.() ?? [
      event.nativeEvent,
    ];
    const keep = 1 - props.smoothing;
    const points = samples.reduce((acc, sample) => {
      const [x, y] = toPadPoint(sample);
      const [lastX, lastY] = acc[acc.length - 1];
      return [
        ...acc,
        [lastX + (x - lastX) * keep, lastY + (y - lastY) * keep] satisfies [
          number,
          number,
        ],
      ];
    }, active.points);
    const now = performance.now();
    const travelPx =
      active.scratch.travelPx +
      getStrokeLength(points.slice(active.points.length - 1));
    const elapsedMs = now - active.scratch.atMs;
    const isScratch =
      travelPx >= SCRATCH_STEP_PX && elapsedMs >= SCRATCH_MIN_GAP_MS;
    if (isScratch) {
      props.onScratch(
        Math.min(
          SCRATCH_VOLUME.max,
          SCRATCH_VOLUME.min +
            (travelPx / elapsedMs) * SCRATCH_VOLUME.perPxPerMs
        )
      );
    }
    activeRef.current = {
      ...active,
      points,
      scratch: isScratch
        ? { travelPx: 0, atMs: now }
        : { travelPx, atMs: active.scratch.atMs },
    };
    setLivePath(toStrokePath(points));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const active = activeRef.current;
    if (active === undefined || active.pointerId !== event.pointerId) return;
    clearLiveStroke();
    const isDot = getStrokeLength(active.points) < DOT_TRAVEL_PX;
    props.onStroke({
      points: roundToHalf(
        isDot
          ? active.points.slice(0, 1)
          : simplifyStroke({
              points: active.points,
              tolerancePx: props.simplifyPx,
            })
      ),
      durationMs: performance.now() - active.startedAt,
    });
  }

  return (
    <div
      ref={padRef}
      role="img"
      aria-label={props.label}
      className={
        props.disabled
          ? "absolute inset-0"
          : "absolute inset-0 cursor-crosshair"
      }
      style={{ touchAction: props.disabled ? "auto" : "none" }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={cancelStroke}
      onClick={(event) => event.stopPropagation()}
    >
      <svg
        aria-hidden
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
      >
        {isCrayon && (
          <CrayonFilter id={crayonFilterId} crayon={props.crayon} seed={1} />
        )}
        <g filter={isCrayon ? `url(#${crayonFilterId})` : undefined}>
          {isCrayon && (
            <path
              ref={liveBodyRef}
              fill="none"
              stroke="var(--lm-ink-pen)"
              strokeOpacity={props.crayon.bodyOpacity}
              strokeWidth={props.strokeWidthPx * props.crayon.bodyWidthScale}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          <path
            ref={livePathRef}
            fill="none"
            stroke="var(--lm-ink-pen)"
            strokeWidth={props.strokeWidthPx}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
