import type { WeatherPlace } from "./weather-place";

function readOptionalString(value: object, field: string) {
  const text = Reflect.get(value, field);
  return typeof text === "string" && text !== "" ? text : undefined;
}

function readCoordinate(
  value: object,
  options: { field: string; limit: number }
) {
  const coordinate = Reflect.get(value, options.field);
  return typeof coordinate === "number" &&
    Number.isFinite(coordinate) &&
    Math.abs(coordinate) <= options.limit
    ? coordinate
    : undefined;
}

/** Return the place held in `value`, or `undefined` when it has no name or its coordinates are missing or out of range. */
export function parseWeatherPlace(value: unknown): WeatherPlace | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const name = readOptionalString(value, "name");
  const latitude = readCoordinate(value, { field: "latitude", limit: 90 });
  const longitude = readCoordinate(value, { field: "longitude", limit: 180 });
  if (name === undefined || latitude === undefined || longitude === undefined) {
    return undefined;
  }
  return {
    name,
    region: readOptionalString(value, "region"),
    country: readOptionalString(value, "country"),
    countryCode: readOptionalString(value, "countryCode"),
    latitude,
    longitude,
  };
}
