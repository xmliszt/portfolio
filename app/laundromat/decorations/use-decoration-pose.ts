import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { getDecorationPose } from "@/lib/laundromat/decorations/get-decoration-pose";

export function useDecorationPose(options: {
  reaction?: number;
  durationMs: number;
}) {
  const reducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(1);
  const { reaction, durationMs } = options;
  const lastReactionRef = useRef(reaction);

  useEffect(() => {
    if (reaction === lastReactionRef.current || !reaction || document.hidden) {
      lastReactionRef.current = reaction;
      setProgress(1);
      return;
    }
    lastReactionRef.current = reaction;
    const startedAtMs = performance.now();
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastFrameMs = -Infinity;
    setProgress(0);
    function tick(now: number) {
      const next = Math.min(1, (now - startedAtMs) / Math.max(1, durationMs));
      if (now - lastFrameMs >= 1000 / 30 || next === 1) {
        setProgress(next);
        lastFrameMs = now;
      }
      if (next < 1) frame = requestAnimationFrame(tick);
    }
    function stopWhenHidden() {
      if (!document.hidden) return;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      setProgress(1);
    }
    if (reducedMotion) {
      timer = setTimeout(() => setProgress(1), durationMs);
    } else {
      frame = requestAnimationFrame(tick);
    }
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", stopWhenHidden);
    };
  }, [reaction, durationMs, reducedMotion]);

  return {
    progress,
    pose: getDecorationPose({ progress, reducedMotion: !!reducedMotion }),
    reducedMotion,
  };
}
