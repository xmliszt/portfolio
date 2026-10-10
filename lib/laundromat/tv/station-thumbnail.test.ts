import assert from "node:assert/strict";
import { test } from "node:test";

import { getStationThumbnailUrls } from "./get-station-thumbnail-urls";
import { getYouTubeWatchUrl } from "./get-youtube-watch-url";
import { resolveStationThumbnail } from "./resolve-station-thumbnail";

const urls = getStationThumbnailUrls("abc");

function buildLoader(sizes: {
  [url: string]: { width: number; height: number } | undefined;
}) {
  return async (url: string) => sizes[url];
}

test("lists the live thumbnails before the plain one", () => {
  assert.deepEqual(urls, [
    "https://i.ytimg.com/vi/abc/maxresdefault_live.jpg",
    "https://i.ytimg.com/vi/abc/hqdefault_live.jpg",
    "https://i.ytimg.com/vi/abc/hqdefault.jpg",
  ]);
});

test("picks the largest thumbnail that loads", async () => {
  const loadImageSize = buildLoader({
    [urls[0]]: { width: 1280, height: 720 },
    [urls[1]]: { width: 480, height: 360 },
  });
  assert.equal(await resolveStationThumbnail({ urls, loadImageSize }), urls[0]);
});

test("skips YouTube's 120×90 placeholder and failed loads", async () => {
  const loadImageSize = buildLoader({
    [urls[0]]: { width: 120, height: 90 },
    [urls[2]]: { width: 480, height: 360 },
  });
  assert.equal(await resolveStationThumbnail({ urls, loadImageSize }), urls[2]);
});

test("gives up when no thumbnail loads", async () => {
  const loadImageSize = buildLoader({
    [urls[0]]: { width: 120, height: 90 },
  });
  assert.equal(
    await resolveStationThumbnail({ urls, loadImageSize }),
    undefined
  );
});

test("links the station to its YouTube watch page", () => {
  assert.equal(
    getYouTubeWatchUrl("rUxyKA_-grg"),
    "https://www.youtube.com/watch?v=rUxyKA_-grg"
  );
});
