import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";

import { formatStation } from "./format-station";
import type { TvSettings, TvState } from "./tv-state";

/** Return the hit target `label` and `tooltip` for the body of the TV in `state`. */
export function describeTv(options: {
  state: TvState;
  settings: TvSettings;
  copy: LaundromatCopy;
}) {
  const copy = options.copy.tv;
  if (!options.state.on)
    return { label: copy.offLabel, tooltip: copy.offTooltip };
  const station = formatStation({
    index: options.state.station,
    stations: options.settings.stations,
    copy: options.copy,
  });
  return { label: copy.onLabel({ station }), tooltip: station };
}
