const MEDIA_TYPES = {
  jpg: { kind: "image", mimeType: "image/jpeg" },
  jpeg: { kind: "image", mimeType: "image/jpeg" },
  png: { kind: "image", mimeType: "image/png" },
  webp: { kind: "image", mimeType: "image/webp" },
  gif: { kind: "gif", mimeType: "image/gif" },
  mp4: { kind: "video", mimeType: "video/mp4" },
  mov: { kind: "video", mimeType: "video/quicktime" },
} as const;

export type MediaType = (typeof MEDIA_TYPES)[keyof typeof MEDIA_TYPES];

function isKnownExtension(
  extension: string
): extension is keyof typeof MEDIA_TYPES {
  return extension in MEDIA_TYPES;
}

/** Return the media kind and MIME type of the file at `path` from its extension, or `undefined` for an extension auto-posting cannot send. */
export function getMediaType(path: string): MediaType | undefined {
  const extension = path.split(".").at(-1)?.toLowerCase() ?? "";
  return isKnownExtension(extension) ? MEDIA_TYPES[extension] : undefined;
}
