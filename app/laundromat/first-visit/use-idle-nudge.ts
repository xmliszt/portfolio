import { useEffect, useRef, useState } from "react";

import type {
  BedroomConfig,
  GarmentKind,
} from "@/lib/laundromat/first-visit/bedroom-config";
import { pickNudgeGarment } from "@/lib/laundromat/first-visit/pick-nudge-garment";

type IdleNudgeOptions = {
  kinds: GarmentKind[];
  unavailable: GarmentKind[];
  isPaused: boolean;
  isStopped: boolean;
  config: BedroomConfig["motion"]["nudge"];
};

/** Return the garment currently nudged, if any, and `resetIdle`, which restarts the idle wait. Nudges one garment at a time after `config.firstMs` idle, then every `config.gapMs` or so, at most `config.maxCount` times, waiting while paused or the tab is hidden and never once stopped. */
export function useIdleNudge(options: IdleNudgeOptions) {
  const [nudge, setNudge] = useState<{ kind: GarmentKind; count: number }>();
  const optionsRef = useRef(options);
  const resetIdleRef = useRef<() => void>(undefined);

  useEffect(() => {
    optionsRef.current = options;
  });

  useEffect(() => {
    let nextTimer: number | undefined;
    let endTimer: number | undefined;
    let count = 0;
    let last: GarmentKind | undefined;

    function schedule(delayMs: number) {
      window.clearTimeout(nextTimer);
      nextTimer = window.setTimeout(nudgeNext, delayMs);
    }

    function nudgeNext() {
      const { kinds, unavailable, isPaused, isStopped, config } =
        optionsRef.current;
      if (isStopped || count >= config.maxCount) return;
      if (document.hidden || isPaused) {
        schedule(config.retryMs);
        return;
      }
      const kind = pickNudgeGarment({ kinds, unavailable, last, count });
      if (kind === undefined) return;
      last = kind;
      count += 1;
      setNudge({ kind, count });
      window.clearTimeout(endTimer);
      endTimer = window.setTimeout(
        () => setNudge(undefined),
        config.durationMs + 100
      );
      schedule(config.gapMs + (count % 3) * config.gapJitterMs);
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        window.clearTimeout(nextTimer);
        return;
      }
      if (!optionsRef.current.isStopped) {
        schedule(optionsRef.current.config.retryMs);
      }
    }

    resetIdleRef.current = () => {
      setNudge(undefined);
      if (optionsRef.current.isStopped) {
        window.clearTimeout(nextTimer);
        return;
      }
      schedule(optionsRef.current.config.idleResetMs);
    };

    schedule(optionsRef.current.config.firstMs);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.clearTimeout(nextTimer);
      window.clearTimeout(endTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (options.isStopped) resetIdleRef.current?.();
  }, [options.isStopped]);

  function resetIdle() {
    resetIdleRef.current?.();
  }

  return { nudge: options.isStopped ? undefined : nudge, resetIdle };
}
