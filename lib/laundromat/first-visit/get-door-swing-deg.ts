import type { BedroomConfig } from "./bedroom-config";

/** Return the door's open angle `elapsedMs` after the walk-in starts: closed while the lever turns, then a critically damped spring towards `openDeg`. */
export function getDoorSwingDeg(options: {
  elapsedMs: number;
  walkIn: BedroomConfig["motion"]["walkIn"];
}) {
  const { leverMs, openDeg, springOmega } = options.walkIn;
  const seconds = Math.max(0, options.elapsedMs - leverMs) / 1000;
  const decay = (1 + springOmega * seconds) * Math.exp(-springOmega * seconds);
  return openDeg * (1 - decay);
}
