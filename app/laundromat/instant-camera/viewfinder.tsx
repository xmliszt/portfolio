"use client";

import { useRef } from "react";
import { motion } from "motion/react";

import { clampViewfinder } from "@/lib/laundromat/instant-camera/clamp-viewfinder";
import { INSTANT_CAMERA } from "@/lib/laundromat/instant-camera/instant-camera-config";
import { resizeViewfinder } from "@/lib/laundromat/instant-camera/resize-viewfinder";
import { scaleViewfinder } from "@/lib/laundromat/instant-camera/scale-viewfinder";
import type {
  ViewfinderCorner,
  ViewfinderFrame,
  ViewfinderOrientation,
  ViewportSize,
} from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { cn } from "@/lib/utils";

const CORNERS = [
  {
    corner: "top-left",
    place: "-top-3.5 -left-3.5 cursor-nwse-resize",
    mark: "top-3 left-3 border-t-2 border-l-2",
  },
  {
    corner: "top-right",
    place: "-top-3.5 -right-3.5 cursor-nesw-resize",
    mark: "top-3 right-3 border-t-2 border-r-2",
  },
  {
    corner: "bottom-left",
    place: "-bottom-3.5 -left-3.5 cursor-nesw-resize",
    mark: "bottom-3 left-3 border-b-2 border-l-2",
  },
  {
    corner: "bottom-right",
    place: "-bottom-3.5 -right-3.5 cursor-nwse-resize",
    mark: "bottom-3 right-3 border-b-2 border-r-2",
  },
] satisfies { corner: ViewfinderCorner; place: string; mark: string }[];

const WHEEL_STEP = 0.06;

type Gesture = {
  pointerId: number;
  corner: ViewfinderCorner | undefined;
  startX: number;
  startY: number;
  start: ViewfinderFrame;
};

type ViewfinderProps = {
  frame: ViewfinderFrame;
  orientation: ViewfinderOrientation;
  viewport: ViewportSize;
  label: string;
  flashCount: number;
  onFrameChange: (frame: ViewfinderFrame) => void;
};

/** Render the draggable, corner-resizable viewfinder over a dimmed screen, with rule-of-thirds lines, the photo ratio in its corner and a white flash each time `flashCount` goes up. */
export function Viewfinder(props: ViewfinderProps) {
  const gestureRef = useRef<Gesture>(undefined);
  const minShortPx = INSTANT_CAMERA.viewfinderMinShortPx;

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const corner = CORNERS.find(
      ({ corner }) =>
        event.target instanceof HTMLElement &&
        event.target.dataset.viewfinderCorner === corner
    )?.corner;
    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = {
      pointerId: event.pointerId,
      corner,
      startX: event.clientX,
      startY: event.clientY,
      start: props.frame,
    };
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const gesture = gestureRef.current;
    if (gesture === undefined || gesture.pointerId !== event.pointerId) return;
    const dx = event.clientX - gesture.startX;
    const dy = event.clientY - gesture.startY;
    props.onFrameChange(
      gesture.corner === undefined
        ? clampViewfinder({
            frame: {
              ...gesture.start,
              x: gesture.start.x + dx,
              y: gesture.start.y + dy,
            },
            viewport: props.viewport,
          })
        : resizeViewfinder({
            start: gesture.start,
            corner: gesture.corner,
            dx,
            dy,
            orientation: props.orientation,
            viewport: props.viewport,
            minShortPx,
          })
    );
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (gestureRef.current?.pointerId === event.pointerId) {
      gestureRef.current = undefined;
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    props.onFrameChange(
      scaleViewfinder({
        frame: props.frame,
        factor: event.deltaY < 0 ? 1 + WHEEL_STEP : 1 - WHEEL_STEP,
        orientation: props.orientation,
        viewport: props.viewport,
        minShortPx,
      })
    );
  }

  return (
    <div
      role="application"
      tabIndex={0}
      aria-label={props.label}
      data-instant-camera-viewfinder
      className="absolute cursor-grab touch-none shadow-[0_0_0_200vmax_rgba(6,7,8,0.62)] outline-none focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed active:cursor-grabbing"
      style={{
        left: props.frame.x,
        top: props.frame.y,
        width: props.frame.width,
        height: props.frame.height,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onWheel={handleWheel}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
      >
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className="border-[var(--lm-ink-hi)]/15 [&:not(:nth-child(3n))]:border-r [&:nth-child(-n+6)]:border-b"
          />
        ))}
      </div>
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 size-3 -translate-1/2 before:absolute before:top-0 before:left-1/2 before:h-full before:w-px before:bg-[var(--lm-ink-hi)]/50 after:absolute after:top-1/2 after:left-0 after:h-px after:w-full after:bg-[var(--lm-ink-hi)]/50"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1.5 left-1.5 flex items-center gap-x-1.5 text-[9px] tracking-wide text-[var(--lm-ink-hi)]"
      >
        <span className="size-1.5 rounded-full bg-[var(--lm-accent)]" />
        {props.orientation === "portrait" ? "3:4" : "4:3"}
      </span>
      {CORNERS.map(({ corner, place, mark }) => (
        <span
          key={corner}
          aria-hidden
          data-viewfinder-corner={corner}
          className={cn("absolute size-7 touch-none", place)}
        >
          <span
            className={cn(
              "pointer-events-none absolute size-3.5 border-[var(--lm-ink-hi)]",
              mark
            )}
          />
        </span>
      ))}
      <motion.span
        key={props.flashCount}
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white"
        initial={{ opacity: props.flashCount === 0 ? 0 : 0.95 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
}
