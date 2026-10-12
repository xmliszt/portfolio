"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnimationPlaybackControls } from "motion/react";
import { animate, useMotionValue } from "motion/react";

export type BookTurn =
  | {
      kind: "turn";
      from: number;
      to: number;
      grab: number;
      driver: "auto" | "pointer";
    }
  | { kind: "riffle"; from: number; to: number }
  | { kind: "fade"; from: number; to: number };

type UseBookTurnsOptions = {
  turnMs: number;
  riffleMs: number;
  fadeMs: number;
  ease: [number, number, number, number];
  reducedMotion: boolean;
};

const LIFT_PROGRESS = 0.03;
const LIFT_MS = 160;
const MIN_RELEASE_MS = 120;

/** Hold the open spread and the turn in progress: a single-spread step curls one leaf, a longer jump riffles, reduced motion crossfades, and a held leaf follows `moveDrag` until `endDrag` lets it go. */
export function useBookTurns(options: UseBookTurnsOptions) {
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<BookTurn>();
  const progress = useMotionValue(0);
  const timerRef = useRef<number>(undefined);
  const dragRef = useRef<{
    from: number;
    to: number;
    restProgress: number;
    animation: AnimationPlaybackControls | undefined;
  }>(undefined);
  const { turnMs, riffleMs, fadeMs, ease, reducedMotion } = options;

  useEffect(() => {
    if (turn === undefined) return;
    if (turn.kind === "turn") {
      if (turn.driver === "pointer") return;
      const isForward = turn.to > turn.from;
      progress.set(isForward ? 0 : 1);
      const controls = animate(progress, isForward ? 1 : 0, {
        duration: turnMs / 1000,
        ease,
        onComplete: () => {
          setSpread(turn.to);
          setTurn(undefined);
        },
      });
      return () => controls.stop();
    }
    timerRef.current = window.setTimeout(
      () => {
        setSpread(turn.to);
        setTurn(undefined);
      },
      turn.kind === "riffle" ? riffleMs : fadeMs
    );
    return () => window.clearTimeout(timerRef.current);
  }, [turn, progress, turnMs, riffleMs, fadeMs, ease]);

  useEffect(() => () => dragRef.current?.animation?.stop(), []);

  const goToSpread = useCallback(
    (target: number) => {
      if (turn !== undefined || target === spread) return;
      const distance = Math.abs(target - spread);
      if (reducedMotion) {
        setTurn({ kind: "fade", from: spread, to: target });
        return;
      }
      setTurn(
        distance === 1
          ? { kind: "turn", from: spread, to: target, grab: 1, driver: "auto" }
          : { kind: "riffle", from: spread, to: target }
      );
    },
    [turn, spread, reducedMotion]
  );

  const getDragProgress = useCallback(
    (travel: number) => {
      const drag = dragRef.current;
      if (drag === undefined) return progress.get();
      const clampedTravel = Math.min(Math.max(travel, 0), 1);
      return drag.to > drag.from
        ? drag.restProgress + clampedTravel * (1 - drag.restProgress)
        : 1 - clampedTravel;
    },
    [progress]
  );

  /** Lift the leaf toward `to` at `grab` (-1 top edge, 1 bottom edge) and hold it there; return `false` when a turn is already running, `reducedMotion` is on, or `to` is not the next or previous spread. */
  const startDrag = useCallback(
    (dragOptions: { to: number; grab: number; restProgress: number }) => {
      if (turn !== undefined || reducedMotion) return false;
      if (Math.abs(dragOptions.to - spread) !== 1) return false;
      dragRef.current = {
        from: spread,
        to: dragOptions.to,
        restProgress: dragOptions.restProgress,
        animation: undefined,
      };
      progress.set(getDragProgress(0));
      dragRef.current.animation = animate(
        progress,
        getDragProgress(LIFT_PROGRESS),
        { duration: LIFT_MS / 1000, ease: "easeOut" }
      );
      setTurn({
        kind: "turn",
        from: spread,
        to: dragOptions.to,
        grab: dragOptions.grab,
        driver: "pointer",
      });
      return true;
    },
    [turn, spread, reducedMotion, progress, getDragProgress]
  );

  /** Move the held leaf to `travel` (0 at rest, 1 fully turned). */
  const moveDrag = useCallback(
    (travel: number) => {
      const drag = dragRef.current;
      if (drag === undefined) return;
      drag.animation?.stop();
      progress.set(getDragProgress(LIFT_PROGRESS + travel));
    },
    [progress, getDragProgress]
  );

  /** Let go of the held leaf: finish the turn when `commit`, otherwise lay it back down. */
  const endDrag = useCallback(
    (dragOptions: { commit: boolean }) => {
      const drag = dragRef.current;
      if (drag === undefined) return;
      drag.animation?.stop();
      const isForward = drag.to > drag.from;
      const end = dragOptions.commit === isForward ? 1 : 0;
      const remaining = Math.abs(end - progress.get());
      drag.animation = animate(progress, end, {
        duration: Math.max(turnMs * remaining, MIN_RELEASE_MS) / 1000,
        ease: "easeOut",
        onComplete: () => {
          dragRef.current = undefined;
          if (dragOptions.commit) setSpread(drag.to);
          setTurn(undefined);
        },
      });
    },
    [progress, turnMs]
  );

  return {
    spread,
    turn,
    progress,
    goToSpread,
    setSpread,
    startDrag,
    moveDrag,
    endDrag,
  };
}
