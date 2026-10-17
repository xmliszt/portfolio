import type { NextRequest } from "next/server";

import { getGeocodingUrl } from "@/lib/laundromat/weather/get-geocoding-url";
import { parseGeocodingResults } from "@/lib/laundromat/weather/parse-geocoding-results";

const PLACES_REVALIDATE_SECONDS = 24 * 60 * 60;
const GEOCODING_TIMEOUT_MS = 4_000;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 80;

export const dynamic = "force-dynamic";

async function searchPlaces(options: { query: string; language: string }) {
  if (
    options.query.length < MIN_QUERY_LENGTH ||
    options.query.length > MAX_QUERY_LENGTH
  ) {
    return [];
  }
  try {
    const response = await fetch(getGeocodingUrl(options), {
      next: { revalidate: PLACES_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(GEOCODING_TIMEOUT_MS),
    });
    return response.ok ? parseGeocodingResults(await response.json()) : [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const places = await searchPlaces({
    query: (params.get("q") ?? "").trim(),
    language: params.get("language") ?? "en",
  });
  return Response.json(
    { places },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
}
