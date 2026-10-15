import type { WeatherReading } from "./weather-reading";
import { WEATHER_CONDITIONS } from "./weather-reading";

function isWeatherReading(value: object): value is WeatherReading {
  const condition = Reflect.get(value, "condition");
  const unit = Reflect.get(value, "unit");
  const city = Reflect.get(value, "city");
  const aqi = Reflect.get(value, "aqi");
  return (
    WEATHER_CONDITIONS.some((known) => known === condition) &&
    typeof Reflect.get(value, "isDay") === "boolean" &&
    ["temperatureC", "highC", "lowC"].every(
      (field) => typeof Reflect.get(value, field) === "number"
    ) &&
    (city === undefined || typeof city === "string") &&
    (aqi === undefined || typeof aqi === "number") &&
    (unit === "celsius" || unit === "fahrenheit")
  );
}

/** Return the weather reading in a `/weather` response body, or `undefined` when the body says the location is unknown or is malformed. */
export function parseWeatherBody(value: unknown): WeatherReading | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  if (Reflect.get(value, "kind") !== "reading" || !isWeatherReading(value)) {
    return undefined;
  }
  return {
    condition: value.condition,
    isDay: value.isDay,
    temperatureC: value.temperatureC,
    highC: value.highC,
    lowC: value.lowC,
    city: value.city,
    unit: value.unit,
    aqi: value.aqi,
  };
}
