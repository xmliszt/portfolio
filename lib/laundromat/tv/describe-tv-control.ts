import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { formatStation } from "./format-station";
import type { TvSettings, TvState } from "./tv-state";

export type TvControl = "screen" | "tuner" | "volume" | "power";

/** Return the `label`, `tooltip` and whether pressing `control` does anything for the TV in `state`. */
export function describeTvControl(options: {
  control: TvControl;
  state: TvState;
  settings: TvSettings;
  copy: LaundromatCopy;
}) {
  const { state, settings } = options;
  const { stations } = settings;
  const copy = options.copy.tv;
  const station = formatStation({
    index: state.station,
    stations,
    copy: options.copy,
  });
  switch (options.control) {
    case "screen":
      return state.on
        ? {
            label: copy.screenOnLabel({ station }),
            tooltip: copy.screenOnTooltip,
            enabled: true,
          }
        : {
            label: copy.screenOffLabel,
            tooltip: copy.turnOn,
            enabled: true,
          };
    case "tuner": {
      const next = stations[(state.station + 1) % stations.length];
      return {
        label: copy.tunerLabel({ station }),
        tooltip: copy.tunerTooltip({
          nextName: next === undefined ? "" : copy.stations[next.id],
        }),
        enabled: true,
      };
    }
    case "volume":
      return {
        label: copy.volumeLabel({ percent: state.volumePercent }),
        tooltip: copy.volumeTooltip({ percent: state.volumePercent }),
        enabled: true,
      };
    case "power":
      return state.on
        ? {
            label: copy.powerOnLabel,
            tooltip: copy.turnOff,
            enabled: true,
          }
        : {
            label: copy.powerOffLabel,
            tooltip: copy.turnOn,
            enabled: true,
          };
    default: {
      const unhandled: never = options.control;
      return unhandled;
    }
  }
}
