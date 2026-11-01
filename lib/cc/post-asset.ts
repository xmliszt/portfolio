/** One media file of a post: its display `file` name, its `alt` text, and its object `path` in the `command-center-assets` bucket once uploaded. */
export type PostAsset = { file: string; alt: string; path?: string };

export const CC_ASSETS_BUCKET = "command-center-assets";
