import { formatStation } from "./format-station";
import type { TvSettings, TvState } from "./tv-state";

export type TvControl = "screen" | "tuner" | "volume" | "power";

/** Return the `label`, `tooltip` and whether pressing `control` does anything for the TV in `state`. */
export function describeTvControl(options: {
  control: TvControl;
  state: TvState;
  settings: TvSettings;
}) {
  const { state, settings } = options;
  const { stations } = settings;
  const station = formatStation({ index: state.station, stations });
  switch (options.control) {
    case "screen":
      return state.on
        ? { label: `TV screen, ${station}`, tooltip: station, enabled: false }
        : {
            label: "TV screen, off, turn on",
            tooltip: "turn on",
            enabled: true,
          };
    case "tuner": {
      const next = (state.station + 1) % stations.length;
      return {
        label: `TV channel, ${station}`,
        tooltip: `next station · ${stations[next]}`,
        enabled: true,
      };
    }
    case "volume":
      return {
        label: `TV volume, ${state.volumePercent}%`,
        tooltip: `volume · ${state.volumePercent}%`,
        enabled: true,
      };
    case "power":
      return state.on
        ? {
            label: "TV power, on, turn off",
            tooltip: "turn off",
            enabled: true,
          }
        : {
            label: "TV power, off, turn on",
            tooltip: "turn on",
            enabled: true,
          };
    default: {
      const unhandled: never = options.control;
      return unhandled;
    }
  }
}
