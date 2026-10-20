/** Return `isoDate` as a short day, month and year in English, such as `19 Oct 2026`. */
export function formatTipDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
