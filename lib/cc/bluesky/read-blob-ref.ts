import type { BlobRef } from "./blob-ref";

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null;
}

/** Return the `blob` of a Bluesky response body or job status when it is a blob reference, else `undefined`. */
export function readBlobRef(body: unknown): BlobRef | undefined {
  if (!isObject(body)) return undefined;
  const blob = isObject(body.jobStatus) ? body.jobStatus.blob : body.blob;
  if (
    !isObject(blob) ||
    blob.$type !== "blob" ||
    !isObject(blob.ref) ||
    typeof blob.ref.$link !== "string" ||
    typeof blob.mimeType !== "string" ||
    typeof blob.size !== "number"
  ) {
    return undefined;
  }
  return {
    $type: "blob",
    ref: { $link: blob.ref.$link },
    mimeType: blob.mimeType,
    size: blob.size,
  };
}
