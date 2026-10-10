const YOUTUBE_MISSING_THUMBNAIL = { width: 120, height: 90 };

/** Return the first of `urls` that `loadImageSize` loads as a real image, skipping failures and YouTube's 120×90 missing-thumbnail placeholder; `undefined` when none loads. */
export async function resolveStationThumbnail(options: {
  urls: string[];
  loadImageSize: (
    url: string
  ) => Promise<{ width: number; height: number } | undefined>;
}): Promise<string | undefined> {
  const [url, ...rest] = options.urls;
  if (url === undefined) return undefined;
  const size = await options.loadImageSize(url);
  const isReal =
    size !== undefined &&
    !(
      size.width === YOUTUBE_MISSING_THUMBNAIL.width &&
      size.height === YOUTUBE_MISSING_THUMBNAIL.height
    );
  if (isReal) return url;
  return resolveStationThumbnail({ ...options, urls: rest });
}
