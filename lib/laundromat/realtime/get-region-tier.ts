import type { RoomRegion } from "./room-presence";

const EARTH_RADIUS_KM = 6371;
const TIER_LIMITS_KM = [500, 2000, 6000];

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

/** Return how far `other` is from `own` as a tier, `0` within 500 km up to `3` beyond 6000 km, and the last tier when either region is unknown. */
export function getRegionTier(options: {
  own: RoomRegion | undefined;
  other: RoomRegion | undefined;
}) {
  const { own, other } = options;
  if (own === undefined || other === undefined) return TIER_LIMITS_KM.length;
  const dLat = toRadians(other.latDeg - own.latDeg);
  const dLon = toRadians(other.lonDeg - own.lonDeg);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(own.latDeg)) *
      Math.cos(toRadians(other.latDeg)) *
      Math.sin(dLon / 2) ** 2;
  const distanceKm = 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
  const tier = TIER_LIMITS_KM.findIndex((limitKm) => distanceKm < limitKm);
  return tier === -1 ? TIER_LIMITS_KM.length : tier;
}
