import type { RoomRegion } from "./room-presence";

function toDegrees(options: { value: unknown; limit: number }) {
  const number =
    typeof options.value === "string"
      ? Number.parseFloat(options.value)
      : options.value;
  if (typeof number !== "number" || !Number.isFinite(number)) return undefined;
  if (Math.abs(number) > options.limit) return undefined;
  return Math.round(number);
}

/** Return the region at `latitude` and `longitude`, numbers or numeric strings, rounded to whole degrees, or `undefined` when either is missing or out of range. */
export function parseRoomRegion(options: {
  latitude: unknown;
  longitude: unknown;
}): RoomRegion | undefined {
  const latDeg = toDegrees({ value: options.latitude, limit: 90 });
  const lonDeg = toDegrees({ value: options.longitude, limit: 180 });
  if (latDeg === undefined || lonDeg === undefined) return undefined;
  return { latDeg, lonDeg };
}
