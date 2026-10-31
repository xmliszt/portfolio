import type { Vec4 } from "@/lib/paws/sim/cat-poses";

import type { DrawContext } from "./render-types";
import { SOFT_PASSES } from "./soft-capsule";
import { traceOutline } from "./trace-outline";

/** Fill a smooth body outline through `samples` in `color`, its edge softened over `blur` world units by fainter, wider strokes underneath. */
export function softOutline(options: {
  draw: DrawContext;
  samples: Vec4[];
  blur: number;
  color: string;
  alpha?: number;
}) {
  const { g, unitPx } = options.draw;
  const alpha = options.alpha ?? 1;
  g.fillStyle = options.color;
  g.strokeStyle = options.color;
  g.lineJoin = "round";
  traceOutline({ g, samples: options.samples });
  if (options.blur * unitPx >= 0.7) {
    for (const [extra, passAlpha] of SOFT_PASSES) {
      if (extra <= 0) continue;
      g.lineWidth = 2 * extra * options.blur;
      g.globalAlpha = alpha * passAlpha;
      g.stroke();
    }
  }
  g.globalAlpha = alpha;
  g.fill();
  g.globalAlpha = 1;
}
