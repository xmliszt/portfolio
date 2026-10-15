import type { WeatherCondition } from "@/lib/laundromat/weather/weather-reading";

export type WindowWeatherLook = ReturnType<typeof getWindowWeather>;

/** Return how `condition` looks through a window: the share of `sunlight` that still comes in, how much `skyCover` hides the sun, moon and stars, the glass `veil` tint and opacity, whether `clouds` drift across the sky, which `particles` fall, and whether `lightning` flashes; clear skies when `condition` is `undefined`. */
export function getWindowWeather(condition: WeatherCondition | undefined) {
  switch (condition) {
    case undefined:
    case "clear":
      return {
        sunlight: 1,
        skyCover: 0,
        veil: undefined,
        clouds: false,
        particles: undefined,
        lightning: false,
      };
    case "cloudy":
      return {
        sunlight: 0.45,
        skyCover: 0.6,
        veil: { tone: "dark", opacity: 0.18 },
        clouds: true,
        particles: undefined,
        lightning: false,
      };
    case "fog":
      return {
        sunlight: 0.4,
        skyCover: 0.75,
        veil: { tone: "light", opacity: 0.4 },
        clouds: false,
        particles: undefined,
        lightning: false,
      };
    case "rain":
      return {
        sunlight: 0.3,
        skyCover: 0.85,
        veil: { tone: "dark", opacity: 0.28 },
        clouds: true,
        particles: "rain",
        lightning: false,
      };
    case "snow":
      return {
        sunlight: 0.5,
        skyCover: 0.75,
        veil: { tone: "light", opacity: 0.14 },
        clouds: true,
        particles: "snow",
        lightning: false,
      };
    case "thunder":
      return {
        sunlight: 0.2,
        skyCover: 0.95,
        veil: { tone: "dark", opacity: 0.38 },
        clouds: true,
        particles: "rain",
        lightning: true,
      };
    default: {
      const unhandled: never = condition;
      return unhandled;
    }
  }
}
