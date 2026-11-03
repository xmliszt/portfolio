import { valueNoise } from "@/lib/paws/sim/value-noise";

import type { AnyContext } from "./render-types";

const POINTS = 18;

/** Start a new closed path around `x, y` whose radius `r` varies smoothly by up to `amount` of itself, in a shape fixed by `seed`. */
export function traceBlob(options: {
  g: AnyContext;
  x: number;
  y: number;
  r: number;
  seed: number;
  amount: number;
}) {
  const { g, x, y, r, seed, amount } = options;
  const points = Array.from({ length: POINTS }, (_, i) => {
    const angle = (2 * Math.PI * i) / POINTS;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const bump = valueNoise(4 + 1.3 * cos, seed + 1.3 * sin) - 0.5;
    const radius = r * (1 + 2 * amount * bump);
    return [x + cos * radius, y + sin * radius] as const;
  });
  const midpoint = (i: number) => {
    const [ax, ay] = points[i % POINTS];
    const [bx, by] = points[(i + 1) % POINTS];
    return [(ax + bx) / 2, (ay + by) / 2] as const;
  };
  g.beginPath();
  g.moveTo(...midpoint(POINTS - 1));
  for (let i = 0; i < POINTS; i++)
    g.quadraticCurveTo(...points[i], ...midpoint(i));
  g.closePath();
}
