import { INSTANT_CAMERA } from "./instant-camera-config";

/** Return a tilt for the developed print, between `INSTANT_CAMERA.tiltDeg.min` and `max` degrees either way, from two `random` draws in [0, 1). */
export function pickPolaroidTiltDeg(random: () => number) {
  const { min, max } = INSTANT_CAMERA.tiltDeg;
  const magnitude = min + random() * (max - min);
  return random() < 0.5 ? -magnitude : magnitude;
}
