import type { WeatherCondition } from "./weather-reading";

/** Return the condition the panel draws for a WMO weather interpretation `code`, or `undefined` for a code outside the WMO table. */
export function getWeatherCondition(
  code: number
): WeatherCondition | undefined {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snow";
  if (code >= 95 && code <= 99) return "thunder";
  return undefined;
}
