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

/** Hold the open spread and the turn in progress: a single-spread step curls one leaf, a longer jump riffles, reduced motion crossfades, and a held leaf follows `moveDrag` across and down the page until `endDrag` lets it go. */
export function useBookTurns(options: UseBookTurnsOptions) {
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<BookTurn>();
  const progress = useMotionValue(0);
  const drop = useMotionValue(0);
  const arc = useMotionValue(0);
  const timerRef = useRef<number>(undefined);
  const dragRef = useRef<{
    from: number;
    to: number;
    animations: AnimationPlaybackControls[];
  }>(undefined);
  const { turnMs, riffleMs, fadeMs, ease, reducedMotion } = options;

  useEffect(() => {
    if (turn === undefined) return;
    if (turn.kind === "turn") {
      if (turn.driver === "pointer") return;
      const isForward = turn.to > turn.from;
      progress.set(isForward ? 0 : 1);
      arc.set(1);
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
  }, [turn, progress, arc, turnMs, riffleMs, fadeMs, ease]);

  useEffect(
    () => () => dragRef.current?.animations.forEach((item) => item.stop()),
    []
  );

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
      return drag.to > drag.from ? clampedTravel : 1 - clampedTravel;
    },
    [progress]
  );

  /** Lift the leaf toward `to` at `grab` (-1 top edge, 1 bottom edge) and hold it there; return `false` when a turn is already running, `reducedMotion` is on, or `to` is not the next or previous spread. */
  const startDrag = useCallback(
    (dragOptions: { to: number; grab: number }) => {
      if (turn !== undefined || reducedMotion) return false;
      if (Math.abs(dragOptions.to - spread) !== 1) return false;
      dragRef.current = { from: spread, to: dragOptions.to, animations: [] };
      progress.set(getDragProgress(0));
      drop.set(0);
      arc.set(0);
      dragRef.current.animations = [
        animate(progress, getDragProgress(LIFT_PROGRESS), {
          duration: LIFT_MS / 1000,
          ease: "easeOut",
        }),
      ];
      setTurn({
        kind: "turn",
        from: spread,
        to: dragOptions.to,
        grab: dragOptions.grab,
        driver: "pointer",
      });
      return true;
    },
    [turn, spread, reducedMotion, progress, drop, arc, getDragProgress]
  );

  /** Move the held leaf to `travel` across the spread (0 at rest, 1 fully turned) and `drop` down the page (in page heights). */
  const moveDrag = useCallback(
    (dragOptions: { travel: number; drop: number }) => {
      const drag = dragRef.current;
      if (drag === undefined) return;
      drag.animations.forEach((item) => item.stop());
      progress.set(
        getDragProgress(Math.max(dragOptions.travel, LIFT_PROGRESS))
      );
      drop.set(dragOptions.drop);
    },
    [progress, drop, getDragProgress]
  );

  /** Let go of the held leaf: finish the turn when `commit`, otherwise lay it back down. */
  const endDrag = useCallback(
    (dragOptions: { commit: boolean }) => {
      const drag = dragRef.current;
      if (drag === undefined) return;
      drag.animations.forEach((item) => item.stop());
      const isForward = drag.to > drag.from;
      const end = dragOptions.commit === isForward ? 1 : 0;
      const remaining = Math.abs(end - progress.get());
      const duration = Math.max(turnMs * remaining, MIN_RELEASE_MS) / 1000;
      drag.animations = [
        animate(drop, 0, { duration, ease: "easeOut" }),
        animate(arc, dragOptions.commit ? 1 : 0, { duration, ease: "easeOut" }),
        animate(progress, end, {
          duration,
          ease: "easeOut",
          onComplete: () => {
            dragRef.current = undefined;
            if (dragOptions.commit) setSpread(drag.to);
            setTurn(undefined);
          },
        }),
      ];
    },
    [progress, drop, arc, turnMs]
  );

  return {
    spread,
    turn,
    progress,
    drop,
    arc,
    goToSpread,
    setSpread,
    startDrag,
    moveDrag,
    endDrag,
  };
}
