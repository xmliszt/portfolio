/** Return the YouTube watch page URL of `videoId`. */
export function getYouTubeWatchUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
}
