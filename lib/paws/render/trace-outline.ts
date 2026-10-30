import type { Vec4 } from "@/lib/paws/sim/cat-poses";

import type { AnyContext } from "./render-types";

/** Start a new closed path around `samples` (each `[x, y, r, …]`), offset by each radius on both sides, with round ends. */
export function traceOutline(options: { g: AnyContext; samples: Vec4[] }) {
  const { g, samples } = options;
  const count = samples.length;
  const normals = samples.map((_, i) => {
    const a = samples[Math.max(0, i - 1)];
    const b = samples[Math.min(count - 1, i + 1)];
    const tx = b[0] - a[0];
    const ty = b[1] - a[1];
    const length = Math.hypot(tx, ty) || 1;
    return [-ty / length, tx / length];
  });
  const angle = (i: number) => Math.atan2(normals[i][1], normals[i][0]);
  const first = samples[0];
  const last = samples[count - 1];
  g.beginPath();
  g.moveTo(
    first[0] + normals[0][0] * first[2],
    first[1] + normals[0][1] * first[2]
  );
  for (let i = 1; i < count; i++) {
    g.lineTo(
      samples[i][0] + normals[i][0] * samples[i][2],
      samples[i][1] + normals[i][1] * samples[i][2]
    );
  }
  g.arc(
    last[0],
    last[1],
    last[2],
    angle(count - 1),
    angle(count - 1) - Math.PI,
    true
  );
  for (let i = count - 2; i >= 0; i--) {
    g.lineTo(
      samples[i][0] - normals[i][0] * samples[i][2],
      samples[i][1] - normals[i][1] * samples[i][2]
    );
  }
  g.arc(
    first[0],
    first[1],
    first[2],
    angle(0) - Math.PI,
    angle(0) - Math.PI * 2,
    true
  );
  g.closePath();
}
