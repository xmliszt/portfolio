import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import type { TvStation } from "./tv-state";

/** Return the on-screen caption of station `index` (0-based), e.g. `ch 03 · piano night`. */
export function formatStation(options: {
  index: number;
  stations: TvStation[];
  copy: LaundromatCopy;
}) {
  const station = options.stations[options.index];
  return options.copy.tv.station({
    channel: String(options.index + 1).padStart(2, "0"),
    name: station === undefined ? "" : options.copy.tv.stations[station.id],
  });
}
