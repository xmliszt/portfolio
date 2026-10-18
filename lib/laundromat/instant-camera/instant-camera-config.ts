/** Tuning for the instant camera: note length, photo size per render quality, viewfinder limits and timings. */
export const INSTANT_CAMERA = {
  noteMaxChars: 60,
  noteMaxLines: 2,
  photoLongPx: { full: 1800, lite: 1200 },
  viewfinderMinShortPx: 96,
  startHeightRatio: 0.56,
  handoffMs: 3000,
  developMs: { full: 3200, lite: 400 },
  tiltDeg: { min: 0.8, max: 2.5 },
  printFileName: "laundro-cafe.png",
  sharedFileName: "laundro-cafe.jpg",
} as const;
