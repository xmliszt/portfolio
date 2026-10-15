import type { TemperatureUnit } from "./weather-reading";

const FAHRENHEIT_COUNTRIES = [
  "US",
  "PR",
  "GU",
  "VI",
  "AS",
  "MP",
  "BS",
  "KY",
  "BZ",
  "LR",
  "PW",
  "FM",
  "MH",
];

/** Return `"fahrenheit"` for an ISO 3166-1 `country` code that reads weather in Fahrenheit, and `"celsius"` for every other code or none. */
export function getTemperatureUnit(
  country: string | undefined
): TemperatureUnit {
  return country !== undefined &&
    FAHRENHEIT_COUNTRIES.includes(country.toUpperCase())
    ? "fahrenheit"
    : "celsius";
}
