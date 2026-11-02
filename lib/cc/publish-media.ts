import type { MediaType } from "./get-media-type";

/** One media file of a post ready to publish: its kind and MIME type, its object `path` in the assets bucket, and its `alt` text. */
export type PublishMedia = MediaType & { path: string; alt: string };
