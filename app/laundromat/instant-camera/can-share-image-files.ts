/** `true` if this is a touch device whose share sheet accepts image files; `false` on desktops and in browsers without file sharing. */
export function canShareImageFiles() {
  try {
    return (
      matchMedia("(pointer: coarse)").matches &&
      navigator.canShare?.({
        files: [new File([""], "photo.png", { type: "image/png" })],
      }) === true
    );
  } catch {
    return false;
  }
}
