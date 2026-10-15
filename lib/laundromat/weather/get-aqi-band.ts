export const AQI_BANDS = [
  "good",
  "moderate",
  "sensitive",
  "unhealthy",
  "veryUnhealthy",
  "hazardous",
] as const;

export type AqiBand = (typeof AQI_BANDS)[number];

const BAND_CEILINGS = [50, 100, 150, 200, 300];

/** Return the US EPA band of `aqi`: `good` up to 50, `moderate` to 100, `sensitive` to 150, `unhealthy` to 200, `veryUnhealthy` to 300, and `hazardous` above. */
export function getAqiBand(aqi: number): AqiBand {
  const index = BAND_CEILINGS.findIndex((ceiling) => aqi <= ceiling);
  return AQI_BANDS[index === -1 ? AQI_BANDS.length - 1 : index];
}
