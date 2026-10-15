import type { AqiBand } from "./get-aqi-band";

export const AQI_BAND_COLORS = {
  good: "#7cc47f",
  moderate: "#e8c547",
  sensitive: "#f29a4a",
  unhealthy: "#e5534b",
  veryUnhealthy: "#a46fd1",
  hazardous: "#9c3b4c",
} satisfies { [band in AqiBand]: string };
