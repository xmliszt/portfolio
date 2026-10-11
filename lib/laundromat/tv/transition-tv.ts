import type { TvEvent, TvSettings, TvState } from "./tv-state";

/** Return the TV state after `event`: power toggles, tuning wraps around `stations`, volume steps through 0–100% and wraps past either end. */
export function transitionTv(options: {
  state: TvState;
  event: TvEvent;
  settings: TvSettings;
}): TvState {
  const { state, event, settings } = options;
  switch (event.type) {
    case "power":
      return { ...state, on: !state.on };
    case "tune": {
      const count = settings.stations.length;
      return {
        ...state,
        station: (((state.station + event.step) % count) + count) % count,
      };
    }
    case "volume": {
      const next =
        state.volumePercent + event.step * settings.volumeStepPercent;
      if (next > 100) return { ...state, volumePercent: 0 };
      if (next < 0) return { ...state, volumePercent: 100 };
      return { ...state, volumePercent: next };
    }
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}
