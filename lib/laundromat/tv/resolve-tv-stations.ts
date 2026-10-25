import type { TvState, TvStation, TvStationId } from "./tv-state";

export type TvSession = {
  tv: TvState;
  stations: TvStation[];
};

export function resolveTvStations(options: {
  session: TvSession;
  stations: TvStation[];
  initialStationId?: TvStationId;
}) {
  const { session, stations, initialStationId } = options;
  if (session.tv.on || session.stations === stations) return session;
  const selectedId =
    initialStationId ?? session.stations[session.tv.station]?.id;
  const station = Math.max(
    0,
    stations.findIndex((item) => item.id === selectedId)
  );
  return { stations, tv: { ...session.tv, station } };
}
