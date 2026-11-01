import sum from "lodash/sum.js";

function sumKnown(values: readonly (number | undefined)[]) {
  const known = values.flatMap((value) => (value === undefined ? [] : [value]));
  return known.length === 0 ? undefined : sum(known);
}

/** Return the total of the last 7 values in `values` (oldest first), the 7 before them, and the change between the two as a fraction; a total is `undefined` when none of its days has a count, and the change is `undefined` unless all 14 days have one. */
export function summariseKeywordSeries(
  values: readonly (number | undefined)[]
) {
  const last7 = values.slice(-7);
  const previous7 = values.slice(-14, -7);
  const last7Total = sumKnown(last7);
  const previous7Total = sumKnown(previous7);
  const isComplete =
    [...previous7, ...last7].filter((value) => value !== undefined).length ===
    14;
  const change =
    !isComplete ||
    last7Total === undefined ||
    previous7Total === undefined ||
    previous7Total === 0
      ? undefined
      : (last7Total - previous7Total) / previous7Total;
  return { last7Total, previous7Total, change };
}
