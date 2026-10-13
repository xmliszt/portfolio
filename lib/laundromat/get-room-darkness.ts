const PEAK = 0.34;
const LAMP_LIFT = 0.6;

/** Return the opacity (0–`PEAK`) of the dark veil over the shop: `PEAK` with no light at all, less as `windowStrength` (0–1, sun and moon through the window) rises, and less again as `lampLevel` (0–1) rises, though the lamp alone lifts only `LAMP_LIFT` of it. */
export function getRoomDarkness(options: {
  windowStrength: number;
  lampLevel: number;
}) {
  const window = Math.min(Math.max(options.windowStrength, 0), 1);
  const lamp = Math.min(Math.max(options.lampLevel, 0), 1);
  return PEAK * (1 - window) * (1 - LAMP_LIFT * lamp);
}
