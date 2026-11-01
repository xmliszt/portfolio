import type { getHourHeat } from "./get-hour-heat";

export type SlotScores =
  | { source: "researched" }
  | {
      source: "own";
      /** Weekday (0 for Monday) × hour in Singapore time: own views from 0 to 1, `undefined` for hours without posts. */
      cells: (number | undefined)[][];
    };

/** Return `heat` as slot scores: own views divided by the busiest hour's, or only the `researched` source when `heat` has no own views. */
export function getSlotScores(options: {
  heat: ReturnType<typeof getHourHeat>;
}): SlotScores {
  const heat = options.heat;
  if (heat.kind === "researched") {
    return { source: "researched" };
  }
  const maxViews = Math.max(1, ...heat.cells.flat().map((views) => views ?? 0));
  return {
    source: "own",
    cells: heat.cells.map((row) =>
      row.map((views) => (views === undefined ? undefined : views / maxViews))
    ),
  };
}
