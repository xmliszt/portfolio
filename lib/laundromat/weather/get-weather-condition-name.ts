import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { WeatherReading } from "./weather-reading";

/** Return the visitor-facing name of `reading`'s condition, `sunny` for a clear sky by day. */
export function getWeatherConditionName(options: {
  reading: Pick<WeatherReading, "condition" | "isDay">;
  copy: LaundromatCopy;
}) {
  const { condition, isDay } = options.reading;
  const { conditions } = options.copy.weatherPanel;
  return condition === "clear" && isDay
    ? conditions.sunny
    : conditions[condition];
}
