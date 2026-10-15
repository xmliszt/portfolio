import type { WeatherReading } from "./weather-reading";
import { WEATHER_CONDITIONS } from "./weather-reading";

const NIGHT_SUFFIX = "-night";

/** Return a sample reading for a `?weather=` value naming a condition, with `-night` appended for night (`"rain-night"`), or `undefined` for any other value. */
export function parseWeatherOverride(
  value: string | null | undefined
): WeatherReading | undefined {
  if (value === null || value === undefined) return undefined;
  const isNight = value.endsWith(NIGHT_SUFFIX);
  const name = isNight ? value.slice(0, -NIGHT_SUFFIX.length) : value;
  const condition = WEATHER_CONDITIONS.find((known) => known === name);
  if (condition === undefined) return undefined;
  return {
    condition,
    isDay: !isNight,
    temperatureC: condition === "snow" ? -3 : 18,
    highC: condition === "snow" ? 1 : 22,
    lowC: condition === "snow" ? -6 : 13,
    city: "Lisbon",
    unit: "celsius",
    aqi: condition === "fog" ? 128 : 38,
  };
}
