import type { NextRequest } from "next/server";

import { getAirQualityUrl } from "@/lib/laundromat/weather/get-air-quality-url";
import { getOpenMeteoUrl } from "@/lib/laundromat/weather/get-open-meteo-url";
import { getRequestedLocation } from "@/lib/laundromat/weather/get-requested-location";
import { getTemperatureUnit } from "@/lib/laundromat/weather/get-temperature-unit";
import { getVisitorLocation } from "@/lib/laundromat/weather/get-visitor-location";
import { parseAirQuality } from "@/lib/laundromat/weather/parse-air-quality";
import { parseOpenMeteoForecast } from "@/lib/laundromat/weather/parse-open-meteo-forecast";
import type { WeatherBody } from "@/lib/laundromat/weather/weather-reading";

const FORECAST_REVALIDATE_SECONDS = 30 * 60;
const AIR_QUALITY_TIMEOUT_MS = 3_000;

export const dynamic = "force-dynamic";

async function getAqi(location: { latitude: number; longitude: number }) {
  try {
    const response = await fetch(getAirQualityUrl(location), {
      next: { revalidate: FORECAST_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(AIR_QUALITY_TIMEOUT_MS),
    });
    return response.ok ? parseAirQuality(await response.json()) : undefined;
  } catch {
    return undefined;
  }
}

async function getWeatherBody(request: NextRequest): Promise<WeatherBody> {
  const location =
    getRequestedLocation(request.nextUrl.searchParams) ??
    getVisitorLocation(request.headers);
  if (location === undefined) return { kind: "unknown" };
  try {
    const [response, aqi] = await Promise.all([
      fetch(getOpenMeteoUrl(location), {
        next: { revalidate: FORECAST_REVALIDATE_SECONDS },
      }),
      getAqi(location),
    ]);
    if (!response.ok) return { kind: "unknown" };
    const forecast = parseOpenMeteoForecast(await response.json());
    if (forecast === undefined) return { kind: "unknown" };
    return {
      kind: "reading",
      ...forecast,
      city: location.city,
      unit: getTemperatureUnit(location.country),
      aqi,
    };
  } catch {
    return { kind: "unknown" };
  }
}

export async function GET(request: NextRequest) {
  return Response.json(await getWeatherBody(request), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
