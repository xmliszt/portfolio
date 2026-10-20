import assert from "node:assert/strict";
import { test } from "node:test";

import { getCoinDropMs, getCoinDropPose } from "./get-coin-drop-pose";

const dropPx = 15;

test("starts upright at the chute and ends flat on the tray", () => {
  assert.deepEqual(getCoinDropPose({ dropPx, atMs: 0 }), {
    heightPx: dropPx,
    tiltDeg: 0,
  });
  assert.deepEqual(
    getCoinDropPose({ dropPx, atMs: getCoinDropMs({ dropPx }) }),
    { heightPx: 0, tiltDeg: 90 }
  );
});

test("falls faster and faster, then bounces lower each time", () => {
  const early = dropPx - getCoinDropPose({ dropPx, atMs: 60 }).heightPx;
  const late =
    getCoinDropPose({ dropPx, atMs: 120 }).heightPx -
    getCoinDropPose({ dropPx, atMs: 180 }).heightPx;
  assert.ok(late > early);
  const peaks = Array.from({ length: 1200 }, (_, atMs) =>
    getCoinDropPose({ dropPx, atMs })
  )
    .map(({ heightPx }) => heightPx)
    .filter(
      (heightPx, index, heights) =>
        index > 240 &&
        heightPx > 0 &&
        heightPx >= (heights.at(index - 1) ?? 0) &&
        heightPx >= (heights.at(index + 1) ?? 0)
    );
  assert.ok(peaks.length >= 2);
  assert.ok(
    peaks.every((peak, index) => index === 0 || peak < (peaks.at(index - 1) ?? Infinity))
  );
  assert.ok((peaks.at(0) ?? dropPx) < dropPx / 4);
});

test("never tips past flat while it wobbles", () => {
  for (let atMs = 0; atMs <= getCoinDropMs({ dropPx }); atMs += 5) {
    const { tiltDeg } = getCoinDropPose({ dropPx, atMs });
    assert.ok(tiltDeg >= 0 && tiltDeg <= 90, `tilt ${tiltDeg} at ${atMs}`);
  }
});
