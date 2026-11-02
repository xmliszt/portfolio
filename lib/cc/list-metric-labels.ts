import { getMetricLabel } from "./get-metric-label";
import { type PlatformId, PLATFORMS } from "./platforms";

/** Return the labels of `platformId`'s metrics, in the order the log form and Telegram take them. */
export function listMetricLabels(options: { platformId: PlatformId }) {
  return PLATFORMS[options.platformId].metrics.map((field) =>
    getMetricLabel({ platformId: options.platformId, field })
  );
}
