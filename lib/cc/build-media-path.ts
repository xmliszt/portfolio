/** Return the folder `media/<sha256>` and the object path inside it for `fileName`, with characters outside `[\w.-]` in the name replaced by `-`; throw when `sha256` is not 64 lowercase hex characters. */
export function buildMediaPath(options: { sha256: string; fileName: string }) {
  if (!/^[0-9a-f]{64}$/.test(options.sha256)) {
    throw new Error("sha256 must be 64 lowercase hex characters");
  }
  const folder = `media/${options.sha256}`;
  const safeName = options.fileName.replace(/[^\w.\-]+/g, "-");
  return { folder, path: `${folder}/${safeName}` };
}
