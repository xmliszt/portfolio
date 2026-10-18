/** Write the PNG that `blob` resolves to onto the clipboard, returning `true` once it is there and `false` when the browser refuses. */
export async function copyImageToClipboard(blob: Promise<Blob>) {
  try {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}
