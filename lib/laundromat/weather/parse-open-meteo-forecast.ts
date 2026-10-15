import { getWeatherCondition } from "./get-weather-condition";

function getField(value: unknown, field: string) {
  return typeof value === "object" && value !== null
    ? Reflect.get(value, field)
    : undefined;
}

function getFirstNumber(value: unknown) {
  return Array.isArray(value) && typeof value[0] === "number"
    ? value[0]
    : undefined;
}

/** Return the `condition`, `isDay`, `temperatureC`, `highC` and `lowC` in an Open-Meteo forecast response body, or `undefined` when any of them is missing or the weather code is unknown. */
export function parseOpenMeteoForecast(body: unknown) {
  const current = getField(body, "current");
  const daily = getField(body, "daily");
  const temperatureC = getField(current, "temperature_2m");
  const code = getField(current, "weather_code");
  const isDay = getField(current, "is_day");
  const highC = getFirstNumber(getField(daily, "temperature_2m_max"));
  const lowC = getFirstNumber(getField(daily, "temperature_2m_min"));
  if (
    typeof temperatureC !== "number" ||
    typeof code !== "number" ||
    typeof isDay !== "number" ||
    highC === undefined ||
    lowC === undefined
  ) {
    return undefined;
  }
  const condition = getWeatherCondition(code);
  if (condition === undefined) return undefined;
  return { condition, isDay: isDay === 1, temperatureC, highC, lowC };
}
