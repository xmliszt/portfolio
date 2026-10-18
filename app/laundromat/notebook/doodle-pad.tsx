"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import { useEffect, useRef } from "react";

import type { DoodleStroke } from "@/lib/laundromat/notebook/doodle-stroke";
import { simplifyStroke } from "@/lib/laundromat/notebook/simplify-stroke";
import { toStrokePath } from "@/lib/laundromat/notebook/to-stroke-path";

const DOT_TRAVEL_PX = 1.5;

type ActiveStroke = {
  pointerId: number;
  points: [number, number][];
  startedAt: number;
};

type DoodlePadProps = {
  label: string;
  widthPx: number;
  heightPx: number;
  strokeWidthPx: number;
  smoothing: number;
  simplifyPx: number;
  disabled: boolean;
  onStrokeStart: () => void;
  onStrokeCancel: () => void;
  onStroke: (stroke: DoodleStroke) => void;
};

function getTravelPx(points: [number, number][]) {
  return points.reduce((total, [x, y], index) => {
    const previous = points.at(index - 1);
    return index === 0 || previous === undefined
      ? total
      : total + Math.hypot(x - previous[0], y - previous[1]);
  }, 0);
}

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
  const activeRef = useRef<ActiveStroke>(undefined);

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
    livePathRef.current?.setAttribute("d", "");
  }

  function cancelStroke() {
    if (activeRef.current === undefined) return;
    clearLiveStroke();
    props.onStrokeCancel();
  }

  useEffect(() => {
    if (!props.disabled) return;
    activeRef.current = undefined;
    livePathRef.current?.setAttribute("d", "");
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
    activeRef.current = {
      pointerId: event.pointerId,
      points: [point],
      startedAt: performance.now(),
    };
    livePathRef.current?.setAttribute("d", toStrokePath([point, point]));
    props.onStrokeStart();
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
    activeRef.current = { ...active, points };
    livePathRef.current?.setAttribute("d", toStrokePath(points));
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    const active = activeRef.current;
    if (active === undefined || active.pointerId !== event.pointerId) return;
    clearLiveStroke();
    const isDot = getTravelPx(active.points) < DOT_TRAVEL_PX;
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
        <path
          ref={livePathRef}
          fill="none"
          stroke="var(--lm-ink-pen)"
          strokeWidth={props.strokeWidthPx}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
