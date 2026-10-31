import { lerp } from "@/lib/paws/sim/lerp";

import type { SceneResources } from "./create-scene-resources";
import { drawFingertip } from "./draw-fingertip";
import { drawRidges } from "./draw-ridges";
import { getFingerprintStyle } from "./get-fingerprint-style";
import type { DrawContext, FingertipKind, SceneFinger } from "./render-types";

const getStrength = (kind: FingertipKind) => {
  switch (kind) {
    case "own":
      return 1;
    case "remote":
      return 0.75;
    default: {
      const unknown: never = kind;
      return unknown;
    }
  }
};

/** Draw each fingertip under the glass at `time` seconds, with its fingerprint showing as it presses and smearing as it drags; remote fingertips are fainter. */
export function drawFingers(options: {
  draw: DrawContext;
  resources: SceneResources;
  fingers: SceneFinger[];
  time: number;
}) {
  const { draw, resources, time } = options;
  for (const finger of options.fingers) {
    if (finger.visibility < 0.01) continue;
    const strength = getStrength(finger.kind) * finger.visibility;
    const press = finger.press;
    const style = getFingerprintStyle(finger.userId);
    drawFingertip({
      draw,
      x: finger.x,
      y: finger.y,
      height: finger.height,
      alpha: strength * lerp(0.85, 0.5, press),
      press,
      style,
    });
    if (press < 0.02) continue;
    const drag = Math.min(0.3, finger.speed / 2500);
    const reach = press * (0.97 + 0.04 * Math.sin(time * 2.1)) * (1 - drag);
    drawRidges({
      g: draw.g,
      resources,
      x: finger.x,
      y: finger.y,
      reach,
      alpha: strength,
      style,
    });
    if (drag > 0.05) {
      drawRidges({
        g: draw.g,
        resources,
        x: finger.x - finger.dx * 1.5,
        y: finger.y - finger.dy * 1.5,
        reach: reach * 0.85,
        alpha: drag * strength,
        style,
      });
    }
  }
}
