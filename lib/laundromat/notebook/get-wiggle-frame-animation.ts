/** Return the CSS `animation` that shows wiggle frame `frame` for one `1 / fps` slot in each cycle of `frameCount` frames, using the keyframes from `getWiggleKeyframes`. */
export function getWiggleFrameAnimation(options: {
  frame: number;
  frameCount: number;
  fps: number;
}) {
  const cycleS = options.frameCount / options.fps;
  const delayS = (options.frame - options.frameCount) / options.fps;
  return `lm-doodle-wiggle ${cycleS}s step-end infinite ${delayS}s`;
}
