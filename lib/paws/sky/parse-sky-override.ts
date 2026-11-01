import type { Season, SkyOverride, Weather } from "./sky-types";

const SEASONS = [
  "spring",
  "summer",
  "autumn",
  "winter",
  "wet",
  "dry",
] as const satisfies Season[];
const WEATHERS = ["clear", "rain", "snow"] as const satisfies Weather[];

const isSeason = (value: string | null): value is Season =>
  SEASONS.some((season) => season === value);
const isWeather = (value: string | null): value is Weather =>
  WEATHERS.some((weather) => weather === value);

/** Return the `hour`, `season` and `weather` replacements in `params`, leaving out any that are missing or invalid. */
export function parseSkyOverride(params: URLSearchParams): SkyOverride {
  const rawHour = params.get("hour");
  const hour =
    rawHour === null || rawHour.trim() === "" ? NaN : Number(rawHour);
  const season = params.get("season");
  const weather = params.get("weather");
  return {
    hour: Number.isFinite(hour) && hour >= 0 && hour < 24 ? hour : undefined,
    season: isSeason(season) ? season : undefined,
    weather: isWeather(weather) ? weather : undefined,
  };
}
