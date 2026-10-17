import { parseWeatherPlace } from "./parse-weather-place";

/** Return the places in a `/weather/places` response body, skipping malformed ones, or none when the body is malformed. */
export function parsePlacesBody(value: unknown) {
  const places =
    typeof value === "object" && value !== null
      ? Reflect.get(value, "places")
      : undefined;
  if (!Array.isArray(places)) return [];
  return places.flatMap((place: unknown) => {
    const parsed = parseWeatherPlace(place);
    return parsed === undefined ? [] : [parsed];
  });
}
