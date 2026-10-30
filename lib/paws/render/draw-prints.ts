import type { SceneResources } from "./create-scene-resources";
import { drawFingertip } from "./draw-fingertip";
import { drawNose } from "./draw-nose";
import { drawRidges } from "./draw-ridges";
import { getFingerprintStyle } from "./get-fingerprint-style";
import { getTintedPrint } from "./get-tinted-print";
import { PAW_PRINT_BOX } from "./paw-print-box";
import { PRINT_LIFE_SECONDS } from "./print-life-seconds";
import type { DrawContext, ScenePrint } from "./render-types";

/** Draw every paw, nose and finger print still fading on the glass at `time` seconds. */
export function drawPrints(options: {
  draw: DrawContext;
  resources: SceneResources;
  prints: ScenePrint[];
  time: number;
}) {
  const { draw, resources, time } = options;
  const { g } = draw;
  for (const print of options.prints) {
    const left = 1 - (time - print.bornAt) / PRINT_LIFE_SECONDS[print.kind];
    if (left <= 0 || left > 1) continue;
    const fade = left * left;
    switch (print.kind) {
      case "paw": {
        g.save();
        g.translate(print.x, print.y);
        g.rotate(print.angle);
        g.scale(print.scale, print.scale);
        g.globalAlpha = 0.55 * fade;
        g.drawImage(
          getTintedPrint({
            resources,
            color: print.color,
            variant: print.variant,
          }),
          PAW_PRINT_BOX.x0,
          PAW_PRINT_BOX.y0,
          PAW_PRINT_BOX.width,
          PAW_PRINT_BOX.height
        );
        g.restore();
        break;
      }
      case "nose":
        drawNose({
          g,
          x: print.x,
          y: print.y,
          angle: print.angle,
          k: print.scale,
          h: 0.8,
          color: print.color,
          alpha: 0.5 * fade,
        });
        break;
      case "finger":
        drawFingertip({
          draw,
          x: print.x,
          y: print.y,
          height: 1.2,
          alpha: 0.16 * fade,
          press: 0,
        });
        drawRidges({
          g,
          resources,
          x: print.x,
          y: print.y,
          reach: print.pressure * Math.pow(left, 0.6),
          alpha: 0.6 * left,
          style: getFingerprintStyle(print.userId),
        });
        break;
      default: {
        const unknown: never = print;
        return unknown;
      }
    }
  }
  g.globalAlpha = 1;
}
