const OPEN_METEO_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

/** Return the Open-Meteo forecast URL for today's current weather and high and low at `latitude` and `longitude`, each rounded to one decimal place. */
export function getOpenMeteoUrl(options: {
  latitude: number;
  longitude: number;
}) {
  const params = new URLSearchParams({
    latitude: options.latitude.toFixed(1),
    longitude: options.longitude.toFixed(1),
    current: "temperature_2m,weather_code,is_day",
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "1",
  });
  return `${OPEN_METEO_FORECAST_URL}?${params.toString()}`;
}
