import { mixHex } from "./mix-hex";
import type { DrawContext } from "./render-types";
import { SOFT_PASSES } from "./soft-capsule";

/** Fill the path that `trace` starts in `color`, its edge softened over `blur` world units by fainter, wider strokes underneath that also shift toward `edgeFade` when it is given and `color` is a plain colour. */
export function softFill(options: {
  draw: DrawContext;
  trace: () => void;
  blur: number;
  color: string | CanvasGradient;
  alpha?: number;
  edgeFade?: string;
}) {
  const { g, unitPx } = options.draw;
  const alpha = options.alpha ?? 1;
  g.fillStyle = options.color;
  g.strokeStyle = options.color;
  g.lineJoin = "round";
  options.trace();
  if (options.blur * unitPx >= 0.7) {
    for (const [extra, passAlpha] of SOFT_PASSES) {
      if (extra <= 0) continue;
      if (options.edgeFade !== undefined && typeof options.color === "string")
        g.strokeStyle = mixHex({
          from: options.color,
          to: options.edgeFade,
          amount: Math.min(0.85, (extra / 1.5) * 0.85),
        });
      g.lineWidth = 2 * extra * options.blur;
      g.globalAlpha = alpha * passAlpha;
      g.stroke();
    }
  }
  g.globalAlpha = alpha;
  g.fill();
  g.globalAlpha = 1;
}
