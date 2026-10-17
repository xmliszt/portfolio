const OPEN_METEO_GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search";
const PLACE_RESULT_COUNT = 6;

/** Return the Open-Meteo geocoding URL that searches for places named `query`, with names in `language`'s base language (`"pt"` for `"pt-br"`). */
export function getGeocodingUrl(options: { query: string; language: string }) {
  const params = new URLSearchParams({
    name: options.query,
    count: String(PLACE_RESULT_COUNT),
    language: options.language.split("-")[0] ?? "en",
    format: "json",
  });
  return `${OPEN_METEO_GEOCODING_URL}?${params.toString()}`;
}
