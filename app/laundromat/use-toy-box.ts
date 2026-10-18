import { useEffect, useRef, useState } from "react";

import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { TOY_BOX_STORAGE_KEY } from "@/lib/laundromat/toy/toy-box-storage-key";
import { TOY_FLIGHT } from "@/lib/laundromat/toy/toy-flight-timeline";
import { TOY_STILL_POSES } from "@/lib/laundromat/toy/toy-still-poses";

import type { ToyBoxView } from "./objects/scene-views";

const OPENED = "opened";

function readIsOpened() {
  try {
    return window.localStorage.getItem(TOY_BOX_STORAGE_KEY) === OPENED;
  } catch {
    return false;
  }
}

function rememberOpened() {
  try {
    window.localStorage.setItem(TOY_BOX_STORAGE_KEY, OPENED);
  } catch {
    return;
  }
}

/** Return the toy box's view, remembered as opened in `localStorage` once this visitor opens it, with `open` to unbox it and `play` to fly the car, which does nothing while a run is under way. */
export function useToyBox(options: {
  details: SceneConfig["details"]["toyBox"];
  reducedMotion: boolean;
}) {
  const [view, setView] = useState<ToyBoxView>({ kind: "closed" });
  const timerRef = useRef<number>(undefined);

  useEffect(() => {
    if (readIsOpened()) setView({ kind: "open", runStartedAtMs: -Infinity });
  }, []);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  function open() {
    if (view.kind !== "closed") return;
    rememberOpened();
    setView({ kind: "opening" });
    const { lidFallMs, boxFadeMs } = options.details;
    timerRef.current = window.setTimeout(
      () => setView({ kind: "open", runStartedAtMs: -Infinity }),
      (options.reducedMotion ? 0 : lidFallMs) + boxFadeMs
    );
  }

  function play() {
    if (view.kind !== "open") return;
    const runMs = options.reducedMotion
      ? TOY_STILL_POSES.totalMs
      : TOY_FLIGHT.totalMs;
    const nowMs = performance.now();
    if (nowMs - view.runStartedAtMs < runMs) return;
    setView({ kind: "open", runStartedAtMs: nowMs });
  }

  return { view, open, play };
}
