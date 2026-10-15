import type { TemperatureUnit } from "./weather-reading";

/** Return `celsius` as a whole number of degrees in `unit`, followed by a degree sign. */
export function formatTemperature(options: {
  celsius: number;
  unit: TemperatureUnit;
}) {
  const degrees =
    options.unit === "fahrenheit"
      ? (options.celsius * 9) / 5 + 32
      : options.celsius;
  const rounded = Math.round(degrees);
  return `${rounded === 0 ? 0 : rounded}°`;
}
