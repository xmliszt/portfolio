import type { TvEvent, TvSettings, TvState } from "./tv-state";

/** Return the TV state after `event`: power toggles, tuning wraps around `stations`, volume clamps to 0–100%. */
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
    case "volume":
      return {
        ...state,
        volumePercent: Math.min(
          100,
          Math.max(
            0,
            state.volumePercent + event.step * settings.volumeStepPercent
          )
        ),
      };
    default: {
      const unhandled: never = event;
      return unhandled;
    }
  }
}
