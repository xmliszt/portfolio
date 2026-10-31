"use client";

import type { RefObject } from "react";
import { useImperativeHandle, useRef } from "react";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { COAT_INKS } from "@/lib/paws/cat-look";
import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import type { DerivedCat } from "@/lib/paws/sim/derive-cat";
import { cn } from "@/lib/utils";

const KEY_STEP = ROOM_LIMITS.worldWidth / 10;
const MAX_DPR = 2;

export type PanBarHandle = {
  draw: (frame: {
    cats: DerivedCat[];
    ownCatId: string | undefined;
    fromX: number;
    visibleWidth: number;
  }) => void;
};

type PanBarProps = {
  handleRef: RefObject<PanBarHandle | undefined>;
  label: string;
  centerX: () => number;
  onPan: (centerX: number) => void;
};

/** Render a small map of the whole room as a slider: dragging or pressing the arrow keys asks `onPan` for a new world x to center the view on, and `draw`, exposed through `handleRef`, places the visible part and a dot per cat. */
export function PanBar(props: PanBarProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLSpanElement>(null);
  const dotsRef = useRef<HTMLCanvasElement>(null);
  const { worldWidth, worldHeight } = ROOM_LIMITS;

  useImperativeHandle(props.handleRef, () => ({
    draw: (frame) => {
      const track = trackRef.current;
      const thumb = thumbRef.current;
      const dots = dotsRef.current;
      const g = dots?.getContext("2d");
      if (track === null || thumb === null || dots === null || !g) return;
      thumb.style.left = `${(frame.fromX / worldWidth) * 100}%`;
      thumb.style.width = `${(frame.visibleWidth / worldWidth) * 100}%`;
      track.setAttribute(
        "aria-valuenow",
        String(
          Math.round(
            ((frame.fromX + frame.visibleWidth / 2) / worldWidth) * 100
          )
        )
      );
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = dots.clientWidth;
      const height = dots.clientHeight;
      if (dots.width !== Math.round(width * dpr)) {
        dots.width = Math.round(width * dpr);
        dots.height = Math.round(height * dpr);
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, width, height);
      for (const cat of frame.cats) {
        g.fillStyle = COAT_INKS[cat.look.coat];
        g.beginPath();
        g.arc(
          (cat.x / worldWidth) * width,
          (cat.y / worldHeight) * height,
          cat.userId === frame.ownCatId ? 3 : 2,
          0,
          Math.PI * 2
        );
        g.fill();
      }
    },
  }));

  function panTo(event: React.PointerEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    props.onPan(((event.clientX - bounds.left) / bounds.width) * worldWidth);
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    panTo(event);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) panTo(event);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const moves: { [key: string]: number | undefined } = {
      ArrowLeft: props.centerX() - KEY_STEP,
      ArrowRight: props.centerX() + KEY_STEP,
      Home: 0,
      End: worldWidth,
    };
    const move = moves[event.key];
    if (move === undefined) return;
    event.preventDefault();
    props.onPan(move);
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-label={props.label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={50}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className={cn(
        FOCUS_RING_CLASS,
        "relative h-10 w-36 cursor-grab touch-none active:cursor-grabbing border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)]"
      )}
    >
      <canvas
        ref={dotsRef}
        aria-hidden
        className="absolute inset-0 size-full"
      />
      <span
        ref={thumbRef}
        aria-hidden
        className="absolute inset-y-0 border-x-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-yellow)] mix-blend-multiply"
      />
    </div>
  );
}
