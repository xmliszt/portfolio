import type { Vec4 } from "@/lib/paws/sim/cat-poses";

import type { DrawContext } from "./render-types";
import { softFill } from "./soft-fill";
import { traceOutline } from "./trace-outline";

/** Fill a smooth body outline through `samples` in `color`, its edge softened over `blur` world units by fainter, wider strokes underneath. */
export function softOutline(options: {
  draw: DrawContext;
  samples: Vec4[];
  blur: number;
  color: string | CanvasGradient;
  alpha?: number;
  edgeFade?: string;
}) {
  const { g } = options.draw;
  softFill({
    ...options,
    trace: () => traceOutline({ g, samples: options.samples }),
  });
}
