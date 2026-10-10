import { getLinePosition } from "./get-line-position";

export type FittedEntry = {
  id: string;
  page: number;
  lineStart: number;
  lineCount: number;
  lines: string[];
  meta: string | undefined;
};

export type PageRow = {
  key: string;
  entryId: string;
  row: number;
  kind: "text" | "meta";
  text: string;
  lineInEntry: number;
  isLastTextRow: boolean;
};

type RowAtLine = Pick<
  PageRow,
  "kind" | "text" | "lineInEntry" | "isLastTextRow"
> & {
  lineIndex: number;
};

type LayoutPageRowsOptions = {
  entries: FittedEntry[];
  page: number;
  linesPerPage: number;
};

/** Return the rows of `page`: each entry's wrapped lines from its stored first line, cut to `lineCount - 1` text rows, then its `meta` row on its last line. */
export function layoutPageRows(options: LayoutPageRowsOptions): PageRow[] {
  const { linesPerPage } = options;
  return options.entries.flatMap((entry) => {
    const firstLine = (entry.page - 1) * linesPerPage + entry.lineStart - 1;
    const textRowCount = Math.max(0, entry.lineCount - (entry.meta === undefined ? 0 : 1));
    const textRows = entry.lines.slice(0, textRowCount).map(
      (text, index): RowAtLine => ({
        kind: "text",
        text,
        lineInEntry: index,
        lineIndex: firstLine + index,
        isLastTextRow: index === Math.min(entry.lines.length, textRowCount) - 1,
      })
    );
    const metaRows: RowAtLine[] =
      entry.meta === undefined
        ? []
        : [
            {
              kind: "meta",
              text: entry.meta,
              lineInEntry: entry.lineCount - 1,
              lineIndex: firstLine + entry.lineCount - 1,
              isLastTextRow: false,
            },
          ];
    return [...textRows, ...metaRows].flatMap((row) => {
      const position = getLinePosition({ lineIndex: row.lineIndex, linesPerPage });
      if (position.page !== options.page) return [];
      return [
        {
          key: `${entry.id}:${row.lineIndex}`,
          entryId: entry.id,
          row: position.row,
          kind: row.kind,
          text: row.text,
          lineInEntry: row.lineInEntry,
          isLastTextRow: row.isLastTextRow,
        },
      ];
    });
  });
}
