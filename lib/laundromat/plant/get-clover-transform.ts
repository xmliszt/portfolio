/** Return the canvas matrix that draws a clover sprite, already rendered at `pixelRatio`, centred on CSS point `x`,`y`, rotated by `rotation`, flipped by `flip` and scaled by `spriteScale`. */
export function getCloverTransform(options: {
  x: number;
  y: number;
  rotation: number;
  flip: number;
  spriteScale: number;
  pixelRatio: number;
}) {
  const cos = Math.cos(options.rotation) * options.spriteScale;
  const sin = Math.sin(options.rotation) * options.spriteScale;
  return {
    a: cos,
    b: sin,
    c: -sin * options.flip,
    d: cos * options.flip,
    e: options.x * options.pixelRatio,
    f: options.y * options.pixelRatio,
  };
}
