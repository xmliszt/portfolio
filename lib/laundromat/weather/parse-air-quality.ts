/** Return the current US AQI, rounded to a whole number, in an Open-Meteo air quality response body, or `undefined` when the body has none. */
export function parseAirQuality(body: unknown) {
  if (typeof body !== "object" || body === null) return undefined;
  const current = Reflect.get(body, "current");
  if (typeof current !== "object" || current === null) return undefined;
  const aqi = Reflect.get(current, "us_aqi");
  return typeof aqi === "number" && Number.isFinite(aqi) && aqi >= 0
    ? Math.round(aqi)
    : undefined;
}
