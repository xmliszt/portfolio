const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/** Return the local day of `timestampMs` as `oct 8`. */
export function formatEntryDay(timestampMs: number) {
  const date = new Date(timestampMs);
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}
