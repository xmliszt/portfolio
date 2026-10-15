function parseCoordinate(options: { value: string | null; limit: number }) {
  if (options.value === null || options.value.trim() === "") return undefined;
  const coordinate = Number(options.value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= options.limit
    ? coordinate
    : undefined;
}

function decodeCity(value: string | null) {
  if (value === null || value === "") return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

/** Return the visitor's `latitude`, `longitude`, `city` and `country` from Vercel's IP geolocation request headers, or `undefined` when the coordinates are missing or out of range. */
export function getVisitorLocation(headers: Headers) {
  const latitude = parseCoordinate({
    value: headers.get("x-vercel-ip-latitude"),
    limit: 90,
  });
  const longitude = parseCoordinate({
    value: headers.get("x-vercel-ip-longitude"),
    limit: 180,
  });
  if (latitude === undefined || longitude === undefined) return undefined;
  return {
    latitude,
    longitude,
    city: decodeCity(headers.get("x-vercel-ip-city")),
    country: headers.get("x-vercel-ip-country") ?? undefined,
  };
}
