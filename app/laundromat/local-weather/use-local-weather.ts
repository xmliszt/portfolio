"use client";

import { useContext } from "react";

import { LocalWeatherContext } from "./local-weather-context";

/** Return the weather where the visitor is, in the temperature unit they chose, with that unit and its setter. */
export function useLocalWeather() {
  return useContext(LocalWeatherContext);
}
