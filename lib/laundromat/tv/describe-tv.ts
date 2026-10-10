import { formatStation } from "./format-station";
import type { TvSettings, TvState } from "./tv-state";

/** Return the hit target `label` and `tooltip` for the body of the TV in `state`. */
export function describeTv(options: { state: TvState; settings: TvSettings }) {
  if (!options.state.on) return { label: "TV, off", tooltip: "tv · off" };
  const station = formatStation({
    index: options.state.station,
    stations: options.settings.stations,
  });
  return { label: `TV, on, ${station}`, tooltip: station };
}
