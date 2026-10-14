import type { TvStation } from "./tv-state";

/** Return the index in `stations` of the station whose id is `storedStation`, and `storedVolume` as a number; each is `undefined` when missing, unknown, or not a whole number from 0 to 100. */
export function parseStoredTv(options: {
  stations: TvStation[];
  storedStation: string | null;
  storedVolume: string | null;
}) {
  const index = options.stations.findIndex(
    (station) => station.id === options.storedStation
  );
  const isWholePercent =
    options.storedVolume !== null &&
    /^\d{1,3}$/.test(options.storedVolume) &&
    Number(options.storedVolume) <= 100;
  return {
    station: index === -1 ? undefined : index,
    volumePercent: isWholePercent ? Number(options.storedVolume) : undefined,
  };
}
