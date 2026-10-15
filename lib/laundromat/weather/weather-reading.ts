export const WEATHER_CONDITIONS = [
  "clear",
  "cloudy",
  "fog",
  "rain",
  "snow",
  "thunder",
] as const;

export type WeatherCondition = (typeof WEATHER_CONDITIONS)[number];

export type TemperatureUnit = "celsius" | "fahrenheit";

export type WeatherReading = {
  condition: WeatherCondition;
  isDay: boolean;
  temperatureC: number;
  highC: number;
  lowC: number;
  city: string | undefined;
  unit: TemperatureUnit;
  aqi: number | undefined;
};

export type WeatherBody =
  | ({ kind: "reading" } & WeatherReading)
  | { kind: "unknown" };
