/** Return the lines an entry takes on the page: its `textLineCount` wrapped lines plus one line for the timestamp. */
export function getEntryLineCount(textLineCount: number) {
  return textLineCount + 1;
}
