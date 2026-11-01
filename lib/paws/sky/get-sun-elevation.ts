const RADIANS = Math.PI / 180;

/** Return the sun's height above the horizon in degrees at `latitude` on `dayOfYear` (1–366) at local solar `hour`. */
export function getSunElevation(options: {
  latitude: number;
  dayOfYear: number;
  hour: number;
}) {
  const declination =
    23.44 * Math.sin((2 * Math.PI * (options.dayOfYear - 81)) / 365) * RADIANS;
  const latitude = options.latitude * RADIANS;
  const hourAngle = 15 * (options.hour - 12) * RADIANS;
  return (
    Math.asin(
      Math.sin(latitude) * Math.sin(declination) +
        Math.cos(latitude) * Math.cos(declination) * Math.cos(hourAngle)
    ) / RADIANS
  );
}
