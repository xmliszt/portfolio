import { parseCoordinate } from "./parse-coordinate";

const MAX_CITY_LENGTH = 80;

/** Return the `latitude`, `longitude`, `city` (cut to `MAX_CITY_LENGTH` characters) and `country` a `/weather` request asks for in its query, or `undefined` when the coordinates are missing or out of range. */
export function getRequestedLocation(params: URLSearchParams) {
  const latitude = parseCoordinate({
    value: params.get("latitude"),
    limit: 90,
  });
  const longitude = parseCoordinate({
    value: params.get("longitude"),
    limit: 180,
  });
  if (latitude === undefined || longitude === undefined) return undefined;
  return {
    latitude,
    longitude,
    city: params.get("city")?.slice(0, MAX_CITY_LENGTH) || undefined,
    country: params.get("country") || undefined,
  };
}
