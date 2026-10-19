"use client";

import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { useEffect, useRef } from "react";

type UsePageDragOptions = {
  bookRef: RefObject<HTMLElement | null>;
  startDrag: (options: { to: number; grab: number }) => boolean;
  moveDrag: (options: { travel: number; drop: number }) => void;
  endDrag: (options: { commit: boolean }) => void;
  onFlip: () => void;
};

const CLICK_SLOP_PX = 6;
const FLING_PX_PER_MS = 0.4;
const COMMIT_TRAVEL = 0.25;
const VELOCITY_WINDOW_MS = 100;

/** Return a pointer-down handler for a page edge that lifts the leaf where it was grabbed, lets it follow the pointer across and down the spread, and turns it on release past half a page, on a fling, or on a click. */
export function usePageDrag(options: UsePageDragOptions) {
  const optionsRef = useRef(options);
  const stopRef = useRef<() => void>(undefined);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => () => stopRef.current?.(), []);

  return function handleEdgePointerDown(
    event: ReactPointerEvent<HTMLElement>,
    target: { to: number; side: "left" | "right" }
  ) {
    const book = optionsRef.current.bookRef.current;
    if (event.button !== 0 || book === null) return;
    const rect = book.getBoundingClientRect();
    const grab = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    const isHeld = optionsRef.current.startDrag({
      to: target.to,
      grab: Math.min(Math.max(grab, -1), 1),
    });
    if (!isHeld) return;
    event.preventDefault();

    const { pointerId } = event;
    const direction = target.side === "right" ? 1 : -1;
    const startX = event.clientX;
    const startY = event.clientY;
    let samples = [{ x: startX, t: event.timeStamp }];
    let hasMoved = false;

    function getTravel(x: number) {
      return ((startX - x) * direction) / rect.width;
    }

    function handleMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      if (moveEvent.buttons === 0) {
        release({ event: moveEvent, canCommit: false });
        return;
      }
      hasMoved ||= Math.abs(moveEvent.clientX - startX) >= CLICK_SLOP_PX;
      samples = [
        ...samples.filter(
          (sample) => moveEvent.timeStamp - sample.t <= VELOCITY_WINDOW_MS
        ),
        { x: moveEvent.clientX, t: moveEvent.timeStamp },
      ];
      optionsRef.current.moveDrag({
        travel: getTravel(moveEvent.clientX),
        drop: (moveEvent.clientY - startY) / rect.height,
      });
    }

    function handleUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      release({ event: upEvent, canCommit: upEvent.type === "pointerup" });
    }

    function release(releaseOptions: {
      event: PointerEvent;
      canCommit: boolean;
    }) {
      const upEvent = releaseOptions.event;
      stop();
      const isClick =
        !hasMoved && Math.abs(upEvent.clientX - startX) < CLICK_SLOP_PX;
      const first = samples.at(0);
      const elapsedMs = first === undefined ? 0 : upEvent.timeStamp - first.t;
      const velocity =
        first === undefined || elapsedMs <= 0
          ? 0
          : ((first.x - upEvent.clientX) * direction) / elapsedMs;
      const commit =
        releaseOptions.canCommit &&
        (isClick ||
          velocity > FLING_PX_PER_MS ||
          (getTravel(upEvent.clientX) > COMMIT_TRAVEL &&
            velocity > -FLING_PX_PER_MS));
      if (commit) optionsRef.current.onFlip();
      optionsRef.current.endDrag({ commit });
    }

    function stop() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
      stopRef.current = undefined;
    }

    stopRef.current?.();
    stopRef.current = stop;
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
  };
}
