/** Return `isoDate` as a short day, month and year in `locale`, such as `19 Oct 2026` in English. */
export function formatTipDate(options: { isoDate: string; locale: string }) {
  return new Date(options.isoDate).toLocaleDateString(options.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
