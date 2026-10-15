import type { LoopName } from "@/lib/laundromat/audio/sound-names";
import type { WeatherCondition } from "@/lib/laundromat/weather/weather-reading";

/** Return the outdoor loops heard through the window under `condition`: rain in rain and thunderstorms, none otherwise. */
export function getWeatherLoops(
  condition: WeatherCondition | undefined
): LoopName[] {
  switch (condition) {
    case undefined:
    case "clear":
    case "cloudy":
    case "snow":
    case "fog":
      return [];
    case "rain":
    case "thunder":
      return ["rain-outside"];
    default: {
      const unhandled: never = condition;
      return unhandled;
    }
  }
}
