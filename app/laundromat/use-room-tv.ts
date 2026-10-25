import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { parseStoredTv } from "@/lib/laundromat/tv/parse-stored-tv";
import { resolveTvStations } from "@/lib/laundromat/tv/resolve-tv-stations";
import { transitionTv } from "@/lib/laundromat/tv/transition-tv";
import type { TvEvent, TvStation } from "@/lib/laundromat/tv/tv-state";
import {
  TV_RESTORED_EVENT,
  TV_STORAGE_KEYS,
} from "@/lib/laundromat/tv/tv-storage";

function readStoredTv(stations: TvStation[]) {
  try {
    return parseStoredTv({
      stations,
      storedStation: window.localStorage.getItem(TV_STORAGE_KEYS.station),
      storedVolume: window.localStorage.getItem(TV_STORAGE_KEYS.volume),
    });
  } catch {
    return { station: undefined, volumePercent: undefined };
  }
}

export function useRoomTv(details: SceneConfig["details"]["tv"]) {
  const [session, setSession] = useState(() => ({
    stations: details.stations,
    tv: { on: false, station: 0, volumePercent: details.defaultVolumePercent },
  }));
  const [isTouched, setIsTouched] = useState(false);
  const initialized = useRef(false);
  const resolved = resolveTvStations({
    session,
    stations: details.stations,
    initialStationId: details.initialStationId,
  });
  if (resolved !== session) {
    setSession(resolved);
    setIsTouched(false);
  }
  const { stations, tv } = resolved;
  const { initialStationId } = details;

  useLayoutEffect(() => {
    function applyStoredTv() {
      const stored = readStoredTv(stations);
      const preferred = !initialized.current
        ? stations.findIndex((station) => station.id === initialStationId)
        : -1;
      initialized.current = true;
      setSession((current) => ({
        ...current,
        tv: {
          ...current.tv,
          station:
            preferred >= 0 ? preferred : (stored.station ?? current.tv.station),
          volumePercent: stored.volumePercent ?? current.tv.volumePercent,
        },
      }));
    }
    if (!initialized.current) applyStoredTv();
    window.addEventListener(TV_RESTORED_EVENT, applyStoredTv);
    return () => window.removeEventListener(TV_RESTORED_EVENT, applyStoredTv);
  }, [stations, initialStationId]);

  const stationId = stations[tv.station]?.id;
  useEffect(() => {
    if (!isTouched || stationId === undefined) return;
    try {
      window.localStorage.setItem(TV_STORAGE_KEYS.station, stationId);
    } catch {
      return;
    }
  }, [isTouched, stationId]);

  const { volumePercent } = tv;
  useEffect(() => {
    if (!isTouched) return;
    try {
      window.localStorage.setItem(
        TV_STORAGE_KEYS.volume,
        String(volumePercent)
      );
    } catch {
      return;
    }
  }, [isTouched, volumePercent]);

  function dispatchTv(event: TvEvent) {
    if (event.type !== "power") setIsTouched(true);
    setSession((current) => ({
      ...current,
      tv: transitionTv({
        state: current.tv,
        event,
        settings: { ...details, stations: current.stations },
      }),
    }));
  }

  return { tv, dispatchTv, tvDetails: { ...details, stations } };
}
