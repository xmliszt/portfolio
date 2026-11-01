import type { Season } from "./sky-types";

const TROPICS_LATITUDE = 23.5;

/** Return the season at `latitude` in `month` (0 for January): wet or dry inside the tropics, and the four seasons outside, turned half a year south of the equator. */
export function getSeason(options: {
  latitude: number;
  month: number;
}): Season {
  const { latitude, month } = options;
  if (Math.abs(latitude) < TROPICS_LATITUDE) {
    const isNorthernWet = month >= 5 && month <= 9;
    return latitude >= 0 === isNorthernWet ? "wet" : "dry";
  }
  const northMonth = latitude >= 0 ? month : (month + 6) % 12;
  if (northMonth >= 2 && northMonth <= 4) return "spring";
  if (northMonth >= 5 && northMonth <= 7) return "summer";
  if (northMonth >= 8 && northMonth <= 10) return "autumn";
  return "winter";
}
