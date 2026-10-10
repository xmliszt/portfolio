const THUMBNAIL_FILES = [
  "maxresdefault_live.jpg",
  "hqdefault_live.jpg",
  "hqdefault.jpg",
];

/** Return the YouTube thumbnail URLs of `videoId`, largest first. */
export function getStationThumbnailUrls(videoId: string) {
  return THUMBNAIL_FILES.map(
    (file) => `https://i.ytimg.com/vi/${videoId}/${file}`
  );
}
