"use client";

import { DialRoot, useDialKit } from "dialkit";

import { MARK, MoireMark } from "./moire-mark";

import "dialkit/styles.css";

/**
 * Development-only wrapper: the same mark, with every value that decides how it
 * feels exposed as a live control. Tune here, then copy the values back into
 * `MARK` in moire-mark.tsx.
 */
export default function MoireMarkTuner(props: { className?: string }) {
  const p = useDialKit(
    "Moiré mark",
    {
      rings: {
        ringCount: [MARK.ringCount, 3, 70, 1],
        radiusMin: [MARK.radiusMin, 2, 60, 1],
        radiusStep: [MARK.radiusStep, 2, 40, 0.5],
        strokeWidth: [MARK.strokeWidth, 0.25, 4, 0.05],
      },
      motion: {
        restOffset: [MARK.restOffset, 0, 220, 1],
        driftAmount: [MARK.driftAmount, 0, 90, 1],
        driftSeconds: [MARK.driftSeconds, 2, 30, 0.5],
        pointerRange: [MARK.pointerRange, 0, 200, 1],
      },
      tone: {
        opacityA: [MARK.opacityA, 0, 1, 0.01],
        opacityB: [MARK.opacityB, 0, 1, 0.01],
        accent: MARK.accent,
        accentDark: MARK.accentDark,
      },
    },
    { defaultCollapsed: true }
  );

  return (
    <>
      <DialRoot position="bottom-left" />
      <MoireMark
        className={props.className}
        config={{ ...p.rings, ...p.motion, ...p.tone }}
      />
    </>
  );
}
