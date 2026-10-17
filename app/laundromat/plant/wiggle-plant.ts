const WIGGLE_SWINGS: [offset: number, swing: number][] = [
  [0, 0],
  [0.12, -1.6],
  [0.28, 1.3],
  [0.44, -0.9],
  [0.6, 0.55],
  [0.78, -0.25],
  [1, 0],
];

/** Restart the touch wiggle on every `[data-lm-plant-wiggle]` group under `root`: swings of up to 1.6 × `swayDeg` that settle over `durationMs`; nothing when the visitor prefers reduced motion. */
export function wigglePlant(options: {
  root: ParentNode;
  swayDeg: number;
  durationMs: number;
}) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const keyframes = WIGGLE_SWINGS.map(([offset, swing]) => ({
    offset,
    transform: `rotate(${swing * options.swayDeg}deg)`,
    easing: "ease-out",
  }));
  options.root
    .querySelectorAll<SVGGElement>("[data-lm-plant-wiggle]")
    .forEach((group) => {
      group.getAnimations().forEach((animation) => animation.cancel());
      group.animate(keyframes, { duration: options.durationMs });
    });
}
