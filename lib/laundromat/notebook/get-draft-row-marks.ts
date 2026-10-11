/** Return where the draft's selection and caret fall on one drawn line that starts at `start` and holds `length` characters: `selected` as a character range on the line when the selection overlaps it, and `caretAt` when the selection is collapsed at an offset this line owns, up to `nextStart`. */
export function getDraftRowMarks(options: {
  start: number;
  length: number;
  nextStart: number | undefined;
  selection: { start: number; end: number };
}) {
  const { start, length, selection } = options;
  function toLine(offset: number) {
    return Math.min(length, Math.max(0, offset - start));
  }
  if (selection.start === selection.end) {
    const isOwned =
      selection.start >= start &&
      (options.nextStart === undefined || selection.start < options.nextStart);
    return {
      selected: undefined,
      caretAt: isOwned ? toLine(selection.start) : undefined,
    };
  }
  const from = toLine(selection.start);
  const to = toLine(selection.end);
  return {
    selected: to > from ? { from, to } : undefined,
    caretAt: undefined,
  };
}
