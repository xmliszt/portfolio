/** Return the on-screen caption of station `index` (0-based), e.g. `ch 03 · piano night`. */
export function formatStation(options: { index: number; stations: string[] }) {
  const channel = String(options.index + 1).padStart(2, "0");
  return `ch ${channel} · ${options.stations[options.index]}`;
}
