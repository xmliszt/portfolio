import { damp } from "@/lib/paws/sim/damp";

import type { FingertipState } from "./render-types";

const HOVER_HEIGHT = 9;

/** Return `fingertip` eased one step toward `input`: fading in or out with presence, lowering and pressing while pressed, and tracking its speed. */
export function stepFingertip(options: {
  fingertip: FingertipState | undefined;
  input: { x: number; y: number; present: boolean; pressed: boolean };
  dtSeconds: number;
}): FingertipState {
  const { input, dtSeconds } = options;
  const previous = options.fingertip ?? {
    x: input.x,
    y: input.y,
    dx: 0,
    dy: 0,
    speed: 0,
    height: HOVER_HEIGHT,
    visibility: 0,
    press: 0,
  };
  const dx = input.x - previous.x;
  const dy = input.y - previous.y;
  return {
    x: input.x,
    y: input.y,
    dx,
    dy,
    speed: damp({
      from: previous.speed,
      to: Math.hypot(dx, dy) / Math.max(dtSeconds, 0.001),
      rate: 10,
      dtSeconds,
    }),
    height: damp({
      from: previous.height,
      to: input.pressed ? 0 : HOVER_HEIGHT,
      rate: input.pressed ? 22 : 8,
      dtSeconds,
    }),
    visibility: damp({
      from: previous.visibility,
      to: input.present ? 1 : 0,
      rate: 8,
      dtSeconds,
    }),
    press: damp({
      from: previous.press,
      to: input.pressed ? 1 : 0,
      rate: input.pressed ? 6 : 18,
      dtSeconds,
    }),
  };
}
