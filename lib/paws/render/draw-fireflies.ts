import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";

import { blurOf } from "./blur-of";
import type { AnyContext } from "./render-types";

/** Draw summer fireflies at `time` seconds onto `g` in world units, each a soft glow that blinks and drifts, as bright as `strength` (0–1). */
export function drawFireflies(options: {
  g: AnyContext;
  time: number;
  seed: number;
  strength: number;
}) {
  const { g, time, strength } = options;
  if (strength < 0.05) return;
  const random = createSeededRandom({
    seed: Math.floor(options.seed * 1e9) + 9,
  });
  for (let i = 0; i < 14; i++) {
    const x0 = random() * ROOM_LIMITS.worldWidth;
    const y0 = random() * ROOM_LIMITS.worldHeight;
    const offset = random() * 10;
    const h = 40 + random() * 120;
    const glow = 0.5 + 0.5 * Math.sin(time * 1.3 + offset * 7);
    if (glow < 0.3) continue;
    const x = x0 + Math.sin(time * 0.3 + offset) * 60;
    const y = y0 + Math.cos(time * 0.27 + offset) * 40;
    const r = blurOf(h, 1) * 1.6;
    const gradient = g.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, `rgba(232,255,138,${0.85 * glow * strength})`);
    gradient.addColorStop(1, "rgba(232,255,138,0)");
    g.fillStyle = gradient;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}
