import assert from "node:assert/strict";
import { test } from "node:test";

import { getInkTimeline } from "./get-ink-timeline";

function buildLine(options: { lengthPx: number }) {
  return {
    durationMs: 0,
    points: [
      [0, 0],
      [options.lengthPx, 0],
    ] satisfies [number, number][],
  };
}

const settings = {
  speedPxPerMs: 0.5,
  minStrokeMs: 60,
  gapMs: 100,
  maxDurationMs: 5000,
};

test("inks each stroke at the default speed when the doodle fits the limit", () => {
  assert.deepEqual(
    getInkTimeline({
      ...settings,
      strokes: [buildLine({ lengthPx: 100 }), buildLine({ lengthPx: 50 })],
    }),
    [
      { delayMs: 0, durationMs: 200 },
      { delayMs: 300, durationMs: 100 },
    ]
  );
});

test("gives a dot the minimum duration", () => {
  const dot = { durationMs: 0, points: [[4, 4]] satisfies [number, number][] };
  assert.deepEqual(getInkTimeline({ ...settings, strokes: [dot] }), [
    { delayMs: 0, durationMs: 60 },
  ]);
});

test("speeds every stroke and gap up by the same factor to end at the limit", () => {
  const timeline = getInkTimeline({
    ...settings,
    strokes: [buildLine({ lengthPx: 2000 }), buildLine({ lengthPx: 2950 })],
  });
  const last = timeline.at(-1);
  assert.ok(last);
  assert.equal(Math.round(last.delayMs + last.durationMs), 5000);
  assert.equal(
    Math.round((timeline[1].durationMs / timeline[0].durationMs) * 100),
    Math.round((2950 / 2000) * 100)
  );
});
