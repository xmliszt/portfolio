type CurlPagePointOptions = {
  x: number;
  y: number;
  progress: number;
  width: number;
  height: number;
  curlStrength: number;
};

const START_OVERSHOOT = 1.15;
const MAX_RADIUS_RATIO = 0.22;
const MAX_TILT_RATIO = 0.3;
const MIN_RADIUS_PX = 0.001;

/** Return where point (`x` from the spine, `y` from the top) of a turning right-hand page lies at turn `progress` 0–1: its new `x` (negative once past the spine), its lift `z` towards the reader, and the page's bend `angle` there in radians. The same curl runs in the WebGL vertex shader. */
export function curlPagePoint(options: CurlPagePointOptions) {
  const { progress, width, height, curlStrength } = options;
  const bend = Math.max(0, Math.sin(progress * Math.PI));
  const radius = width * MAX_RADIUS_RATIO * curlStrength * bend + MIN_RADIUS_PX;
  const tilt = width * MAX_TILT_RATIO * curlStrength * bend;
  const foldX =
    width * START_OVERSHOOT * (1 - progress) - tilt * (options.y / height);
  const distance = options.x - foldX;
  if (distance <= 0) return { x: options.x, z: 0, angle: 0 };
  const angle = distance / radius;
  if (angle < Math.PI) {
    return {
      x: foldX + radius * Math.sin(angle),
      z: radius * (1 - Math.cos(angle)),
      angle,
    };
  }
  return {
    x: foldX - (distance - Math.PI * radius),
    z: 2 * radius,
    angle: Math.PI,
  };
}
