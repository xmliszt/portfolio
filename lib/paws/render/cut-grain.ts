import type { AnyCanvas, AnyContext } from "./render-types";

/** Cut riso grain out of everything drawn on `g`, removing up to `strength` of the ink under each speck. */
export function cutGrain(options: {
  g: AnyContext;
  grain: AnyCanvas;
  width: number;
  height: number;
  dpr: number;
  strength: number;
}) {
  const { g } = options;
  const pattern = g.createPattern(options.grain, "repeat");
  if (pattern === null) return;
  g.save();
  g.setTransform(options.dpr, 0, 0, options.dpr, 0, 0);
  g.globalCompositeOperation = "destination-out";
  g.globalAlpha = options.strength;
  g.fillStyle = pattern;
  g.fillRect(0, 0, options.width, options.height);
  g.restore();
}
