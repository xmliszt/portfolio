const OPEN_METEO_AIR_QUALITY_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality";

/** Return the Open-Meteo air quality URL for the current US AQI at `latitude` and `longitude`, each rounded to one decimal place. */
export function getAirQualityUrl(options: {
  latitude: number;
  longitude: number;
}) {
  const params = new URLSearchParams({
    latitude: options.latitude.toFixed(1),
    longitude: options.longitude.toFixed(1),
    current: "us_aqi",
    timezone: "auto",
  });
  return `${OPEN_METEO_AIR_QUALITY_URL}?${params.toString()}`;
}
