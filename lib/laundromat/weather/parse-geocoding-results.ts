import { parseWeatherPlace } from "./parse-weather-place";
import type { WeatherPlace } from "./weather-place";

/** Return the places in an Open-Meteo geocoding response body, skipping any without a name or usable coordinates, or none when the body holds no results. */
export function parseGeocodingResults(body: unknown): WeatherPlace[] {
  const results =
    typeof body === "object" && body !== null
      ? Reflect.get(body, "results")
      : undefined;
  if (!Array.isArray(results)) return [];
  return results.flatMap((result: unknown) => {
    if (typeof result !== "object" || result === null) return [];
    const place = parseWeatherPlace({
      name: Reflect.get(result, "name"),
      region: Reflect.get(result, "admin1"),
      country: Reflect.get(result, "country"),
      countryCode: Reflect.get(result, "country_code"),
      latitude: Reflect.get(result, "latitude"),
      longitude: Reflect.get(result, "longitude"),
    });
    return place === undefined ? [] : [place];
  });
}
