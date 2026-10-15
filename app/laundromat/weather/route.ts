import type { NextRequest } from "next/server";

import { getOpenMeteoUrl } from "@/lib/laundromat/weather/get-open-meteo-url";
import { getTemperatureUnit } from "@/lib/laundromat/weather/get-temperature-unit";
import { getVisitorLocation } from "@/lib/laundromat/weather/get-visitor-location";
import { parseOpenMeteoForecast } from "@/lib/laundromat/weather/parse-open-meteo-forecast";
import type { WeatherBody } from "@/lib/laundromat/weather/weather-reading";

const FORECAST_REVALIDATE_SECONDS = 30 * 60;

export const dynamic = "force-dynamic";

async function getWeatherBody(request: NextRequest): Promise<WeatherBody> {
  const location = getVisitorLocation(request.headers);
  if (location === undefined) return { kind: "unknown" };
  try {
    const response = await fetch(getOpenMeteoUrl(location), {
      next: { revalidate: FORECAST_REVALIDATE_SECONDS },
    });
    if (!response.ok) return { kind: "unknown" };
    const forecast = parseOpenMeteoForecast(await response.json());
    if (forecast === undefined) return { kind: "unknown" };
    return {
      kind: "reading",
      ...forecast,
      city: location.city,
      unit: getTemperatureUnit(location.country),
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
