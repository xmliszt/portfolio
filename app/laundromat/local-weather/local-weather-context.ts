"use client";

import { createContext } from "react";

import type { WeatherPlace } from "@/lib/laundromat/weather/weather-place";
import type {
  TemperatureUnit,
  WeatherCondition,
  WeatherReading,
} from "@/lib/laundromat/weather/weather-reading";

export type LocalWeather = {
  reading: WeatherReading | undefined;
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
  place: WeatherPlace | undefined;
  setPlace: (place: WeatherPlace | undefined) => void;
  liveCity: string | undefined;
  condition: WeatherCondition | undefined;
  setCondition: (condition: WeatherCondition | undefined) => void;
  lightningStrikes: number;
};

export const LocalWeatherContext = createContext<LocalWeather>({
  reading: undefined,
  unit: "celsius",
  setUnit: () => {},
  place: undefined,
  setPlace: () => {},
  liveCity: undefined,
  condition: undefined,
  setCondition: () => {},
  lightningStrikes: 0,
});
