"use client";

import type { RefObject } from "react";
import { useImperativeHandle } from "react";

import type { SceneLayout } from "@/lib/laundromat/build-scene-layout";
import type { Viewport } from "@/lib/laundromat/compute-camera";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { CameraFocus } from "@/lib/laundromat/parse-camera-focus";
import { getPlantAnchor } from "@/lib/laundromat/plant/get-plant-anchor";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { BLESSING_POP_KEYFRAMES } from "./blessing-pop-keyframes";
import { BlessingPopLabel } from "./blessing-pop-label";
import { CloverShowerLayer } from "./clover-shower-layer";
import { usePlantStreak } from "./use-plant-streak";

export type PlantStreakHandle = { touch: () => void };

type PlantStreakLayerProps = {
  handleRef: RefObject<PlantStreakHandle | undefined>;
  layout: SceneLayout;
  viewport: Viewport | undefined;
  focus: CameraFocus;
  config: SceneConfig;
  copy: LaundromatCopy;
  lite: boolean;
  reducedMotion: boolean;
};

/** Render the plant streak's blessing labels and clover showers, and expose `touch` through `handleRef`. */
export function PlantStreakLayer(props: PlantStreakLayerProps) {
  const streak = usePlantStreak({
    windowMs: props.config.details.plant.streakWindowMs,
    cloverStreak: props.config.details.plant.cloverStreak,
    maxStreak: props.config.details.plant.maxStreak,
    copy: props.copy,
  });

  useImperativeHandle(props.handleRef, () => ({
    touch() {
      if (props.viewport === undefined) return;
      const anchor = getPlantAnchor({
        layout: props.layout,
        viewport: props.viewport,
        focus: props.focus,
        config: props.config,
      });
      if (anchor !== undefined) streak.touch({ anchor });
    },
  }));

  return (
    <>
      <style>{BLESSING_POP_KEYFRAMES}</style>
      {streak.pops.map((pop) => (
        <BlessingPopLabel
          key={pop.id}
          pop={pop}
          reducedMotion={props.reducedMotion}
          onDone={() => streak.removePop(pop.id)}
        />
      ))}
      {streak.showerIds.length > 0 && (
        <CloverShowerLayer
          burstIds={streak.showerIds}
          lite={props.lite}
          still={props.reducedMotion}
          onBurstDone={streak.endShower}
        />
      )}
    </>
  );
}
