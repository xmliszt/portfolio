/** Start a download of `blob` named `fileName`. */
export function saveBlobAsFile(options: { blob: Blob; fileName: string }) {
  const url = URL.createObjectURL(options.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = options.fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
