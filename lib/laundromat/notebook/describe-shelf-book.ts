import { formatEntryDay } from "./format-entry-day";

type DescribeShelfBookOptions = {
  number: number;
  startedAtMs: number;
  filledAtMs: number;
  entryCount: number;
};

/** Return the shelf book's hit target `label` and its `tooltip`, `mar 30 – may 11 · 301 entries`. */
export function describeShelfBook(options: DescribeShelfBookOptions) {
  const span = `${formatEntryDay(options.startedAtMs)} – ${formatEntryDay(options.filledAtMs)}`;
  const entries = `${options.entryCount} ${options.entryCount === 1 ? "entry" : "entries"}`;
  return {
    label: `Open notebook No. ${options.number}, ${span}, ${entries}`,
    tooltip: `${span} · ${entries}`,
  };
}
