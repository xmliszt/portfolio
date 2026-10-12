import { NOTEBOOK_PAGE_METRICS } from "./notebook-page-metrics";

/** Return the CSS `border-radius` of a page on `side`: rounded at the outer edge, nearly square at the spine. */
export function getPageRadius(side: "left" | "right") {
  const { outer, spine } = NOTEBOOK_PAGE_METRICS.cornerRadiusPx;
  return side === "left"
    ? `${outer}px ${spine}px ${spine}px ${outer}px`
    : `${spine}px ${outer}px ${outer}px ${spine}px`;
}
