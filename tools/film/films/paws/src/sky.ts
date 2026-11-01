import { getSky } from "@/lib/paws/sky/get-sky";
import type { Season, Weather } from "@/lib/paws/sky/sky-types";

const DATES: { [season in Season]: string } = {
  spring: "2026-04-20T12:00:00",
  summer: "2026-07-10T12:00:00",
  autumn: "2026-10-20T12:00:00",
  winter: "2026-01-15T12:00:00",
  wet: "2026-12-10T12:00:00",
  dry: "2026-07-10T12:00:00",
};
const LATITUDE = 35;
const TROPICAL_LATITUDE = 5;

/** Return the room's sky at `hour` in `season` and `weather`, the same on every run: a fixed day of that season at a fixed latitude. */
export function skyAt(options: { hour: number; season: Season; weather?: Weather }) {
  const isTropical = options.season === "wet" || options.season === "dry";
  return getSky({
    date: new Date(DATES[options.season]),
    latitude: isTropical ? TROPICAL_LATITUDE : LATITUDE,
    override: { hour: ((options.hour % 24) + 24) % 24, season: options.season, weather: options.weather ?? "clear" },
  });
}
