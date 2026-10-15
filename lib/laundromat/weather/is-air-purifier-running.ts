/** `true` if the air purifier runs: the visitor's `aqi` is known and at least `minAqi`; `false` when it is cleaner or unknown. */
export function isAirPurifierRunning(options: {
  aqi: number | undefined;
  minAqi: number;
}) {
  return options.aqi !== undefined && options.aqi >= options.minAqi;
}
