"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, useMotionValue } from "motion/react";

export type BookTurn = {
  from: number;
  to: number;
  kind: "turn" | "riffle" | "fade";
};

type UseBookTurnsOptions = {
  turnMs: number;
  riffleMs: number;
  fadeMs: number;
  ease: [number, number, number, number];
  reducedMotion: boolean;
};

/** Hold the open spread and the turn in progress: a single-spread step curls one leaf, a longer jump riffles, and reduced motion crossfades instead. */
export function useBookTurns(options: UseBookTurnsOptions) {
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<BookTurn>();
  const progress = useMotionValue(0);
  const timerRef = useRef<number>(undefined);
  const { turnMs, riffleMs, fadeMs, ease, reducedMotion } = options;

  useEffect(() => {
    if (turn === undefined) return;
    if (turn.kind === "turn") {
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

  const goToSpread = useCallback(
    (target: number) => {
      if (turn !== undefined || target === spread) return;
      const distance = Math.abs(target - spread);
      const kind = reducedMotion ? "fade" : distance === 1 ? "turn" : "riffle";
      setTurn({ from: spread, to: target, kind });
    },
    [turn, spread, reducedMotion]
  );

  return { spread, turn, progress, goToSpread, setSpread };
}
