import { clamp } from "@/lib/paws/sim/clamp";
import { smoothstep } from "@/lib/paws/sim/smoothstep";

import { getSeason } from "./get-season";
import { getSkyLight } from "./get-sky-light";
import { getSunElevation } from "./get-sun-elevation";
import type { Season, Sky, SkyOverride, Weather } from "./sky-types";

const MS_PER_DAY = 86_400_000;
const MAX_SOLAR_OFFSET_HOURS = 3;

function getDefaultWeather(options: { season: Season; hour: number }): Weather {
  if (options.season === "winter") return "snow";
  if (options.season === "wet" && options.hour >= 14 && options.hour < 18)
    return "rain";
  return "clear";
}

/** Return the sky at local time `date` for a visitor at `latitude`, placing the sun by `longitude` when it is known and agrees with the clock's time zone to within `MAX_SOLAR_OFFSET_HOURS`, and by the clock otherwise, with any field of `override` replacing what the clock and season would give. */
export function getSky(options: {
  date: Date;
  latitude: number;
  longitude?: number;
  override?: SkyOverride;
}): Sky {
  const { date, latitude, longitude, override } = options;
  const clockHour =
    date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
  const hour = override?.hour ?? clockHour;
  const month = date.getMonth();
  const dayOfYear =
    Math.floor(
      (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) /
        MS_PER_DAY
    ) || 1;
  const season = override?.season ?? getSeason({ latitude, month });
  const weather = override?.weather ?? getDefaultWeather({ season, hour });
  const offsetHours =
    longitude === undefined
      ? 0
      : longitude / 15 + date.getTimezoneOffset() / 60;
  const clockToSolarHours =
    Math.abs(offsetHours) > MAX_SOLAR_OFFSET_HOURS ? 0 : offsetHours;
  const sunElevation = getSunElevation({
    latitude,
    dayOfYear,
    hour: hour + clockToSolarHours,
  });
  const cloud = weather === "clear" ? 0 : 1;
  return {
    hour,
    season,
    weather,
    sunElevation,
    sunSide: clamp((hour + clockToSolarHours - 12) / 6, -1, 1),
    sunlight: smoothstep(0, 12, sunElevation) * (1 - 0.85 * cloud),
    lamp: 1 - smoothstep(-6, 2, sunElevation),
    light: getSkyLight({ sunElevation, weather }),
  };
}
