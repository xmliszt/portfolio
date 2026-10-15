"use client";

import { createContext } from "react";

import type {
  TemperatureUnit,
  WeatherReading,
} from "@/lib/laundromat/weather/weather-reading";

export type LocalWeather = {
  reading: WeatherReading | undefined;
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  lightningStrikes: number;
};

export const LocalWeatherContext = createContext<LocalWeather>({
  reading: undefined,
  unit: "celsius",
  setUnit: () => {},
  lightningStrikes: 0,
});
