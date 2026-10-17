import type { WeatherCondition, WeatherReading } from "./weather-reading";

/** Return `fetched`'s reading when it answers `requestUrl`, with `condition` in place of its own when one is given, or `undefined` when there is no reading for `requestUrl` yet. */
export function applyWeatherCondition(options: {
  fetched: { url: string; reading: WeatherReading | undefined } | undefined;
  requestUrl: string;
  condition: WeatherCondition | undefined;
}) {
  const { fetched, condition } = options;
  if (fetched?.url !== options.requestUrl) return undefined;
  if (fetched.reading === undefined || condition === undefined) {
    return fetched.reading;
  }
  return { ...fetched.reading, condition };
}
