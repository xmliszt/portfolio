/** Write `text` to the clipboard; return `true` if it was written, `false` when the browser refused. */
export async function writeClipboard(text: string) {
  if (navigator.clipboard === undefined) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
