import { LAUNDROMAT_BASE_PATH } from "@/lib/laundromat/hosts";

import type { WeatherPlace } from "./weather-place";

/** Return the `/weather` URL for `place`, or for wherever the visitor's IP address puts them when `place` is `undefined`. */
export function getWeatherRequestUrl(place: WeatherPlace | undefined) {
  const path = `${LAUNDROMAT_BASE_PATH}/weather`;
  if (place === undefined) return path;
  const params = new URLSearchParams({
    latitude: place.latitude.toFixed(2),
    longitude: place.longitude.toFixed(2),
    city: place.name,
    ...(place.countryCode === undefined ? {} : { country: place.countryCode }),
  });
  return `${path}?${params.toString()}`;
}
