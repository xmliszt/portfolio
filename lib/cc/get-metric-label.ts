import { type MetricField, type PlatformId, PLATFORMS } from "./platforms";

/** Return what `platformId` calls `field` on its own insights screen, or the field name with underscores as spaces when it has no name of its own. */
export function getMetricLabel(options: {
  platformId: PlatformId;
  field: MetricField;
}) {
  const labels: { [field in MetricField]?: string } =
    PLATFORMS[options.platformId].metricLabels;
  return labels[options.field] ?? options.field.replace(/_/g, " ");
}
