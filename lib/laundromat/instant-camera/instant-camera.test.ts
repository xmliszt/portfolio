import assert from "node:assert/strict";
import { test } from "node:test";

import { applyFilmTone } from "./apply-film-tone";
import { getNoteFontScale } from "./get-note-font-scale";
import { getPolaroidMetrics } from "./get-polaroid-metrics";
import { getShareIntentUrl } from "./get-share-intent-url";
import { mapScreenRectToSvg } from "./map-screen-rect-to-svg";
import { normalizeMastodonServer } from "./normalize-mastodon-server";
import { parseUnicodeRange } from "./parse-unicode-range";
import { pickPolaroidTiltDeg } from "./pick-polaroid-tilt-deg";
import { SHARE_TARGETS } from "./share-targets";
import { wrapNoteLines } from "./wrap-note-lines";

const measureByLength = (text: string) => [...text].length;

test("wraps a note between words", () => {
  assert.deepEqual(
    wrapNoteLines({
      text: "late night spin cycle",
      maxWidth: 10,
      measure: measureByLength,
    }),
    ["late night", "spin cycle"]
  );
});

test("wraps text without spaces between characters", () => {
  assert.deepEqual(
    wrapNoteLines({
      text: "洗衣店里很安静的夜晚",
      maxWidth: 4,
      measure: measureByLength,
    }),
    ["洗衣店里", "很安静的", "夜晚"]
  );
});

test("sets Korean, Japanese and Chinese notes smaller than Latin ones", () => {
  assert.equal(getNoteFontScale("cozy anyway"), 1);
  assert.ok(getNoteFontScale("빨래방") < 1);
  assert.ok(getNoteFontScale("コインランドリー") < 1);
  assert.ok(getNoteFontScale("洗衣店") < 1);
});

test("gives a landscape print the same bottom margin as a portrait one of the same long edge", () => {
  const portrait = getPolaroidMetrics({ orientation: "portrait", longPx: 400 });
  const landscape = getPolaroidMetrics({
    orientation: "landscape",
    longPx: 400,
  });
  assert.equal(portrait.bottom, landscape.bottom);
  assert.equal(portrait.photoWidth, 300);
  assert.equal(landscape.photoHeight, 300);
  assert.ok(portrait.bottom >= portrait.notePx * 2.1 + portrait.stampPx);
});

test("lifts black and keeps alpha", () => {
  const toned = applyFilmTone(new Uint8ClampedArray([0, 0, 0, 200]));
  assert.ok((toned[0] ?? 0) > 0);
  assert.ok((toned[2] ?? 0) > (toned[0] ?? 0));
  assert.equal(toned[3], 200);
});

test("opens a post on every platform, and on Mastodon only once the server is known", () => {
  for (const target of SHARE_TARGETS) {
    const url = getShareIntentUrl({
      target: target.id,
      text: "snapped at laundro.cafe",
      siteUrl: "https://laundro.cafe",
      mastodonServer: undefined,
    });
    if (target.id === "mastodon") assert.equal(url, undefined);
    else assert.ok(url?.startsWith("https://"));
  }
  assert.equal(
    getShareIntentUrl({
      target: "mastodon",
      text: "hi",
      siteUrl: "https://laundro.cafe",
      mastodonServer: "mastodon.social",
    }),
    "https://mastodon.social/share?text=hi%0Ahttps%3A%2F%2Flaundro.cafe"
  );
});

test("reads a Mastodon server from what people type", () => {
  assert.equal(
    normalizeMastodonServer(" https://Mastodon.Social/@me "),
    "mastodon.social"
  );
  assert.equal(normalizeMastodonServer("@me@fosstodon.org"), "fosstodon.org");
  assert.equal(normalizeMastodonServer("not a server"), undefined);
});

test("reads CSS unicode ranges", () => {
  assert.deepEqual(parseUnicodeRange("U+0000-00FF, U+0131, U+4E??"), [
    { from: 0, to: 255 },
    { from: 0x131, to: 0x131 },
    { from: 0x4e00, to: 0x4eff },
  ]);
});

test("maps the viewfinder onto the drawing's own units", () => {
  assert.deepEqual(
    mapScreenRectToSvg({
      rect: { x: 300, y: 150, width: 200, height: 100 },
      svgBox: { left: 100, top: 50, width: 800, height: 400 },
      viewBox: { x: 0, y: 0, width: 1600, height: 800 },
    }),
    { x: 400, y: 200, width: 400, height: 200 }
  );
});

test("tilts the print a little, never flat", () => {
  const draws = [0, 0.99, 0.5, 0.2];
  const tilts = [0, 1].map(() => pickPolaroidTiltDeg(() => draws.shift() ?? 0));
  for (const tilt of tilts) {
    assert.ok(Math.abs(tilt) >= 0.8 && Math.abs(tilt) <= 2.5);
  }
});
