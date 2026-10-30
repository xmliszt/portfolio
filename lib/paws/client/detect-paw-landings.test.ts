import assert from "node:assert/strict";
import { test } from "node:test";

import type { CatSnapshot, LegSnapshot } from "@/lib/paws/wire-types";

import { detectPawLandings } from "./detect-paw-landings";

const buildSnapshot = (options: {
  heights: number[];
  sleep?: number;
}): CatSnapshot => {
  const legs = options.heights.map((h, index) => ({ x: index * 10, y: 5, h }));
  const [a, b, c, d] = legs;
  const fallback: LegSnapshot = { x: 0, y: 0, h: 0 };
  return {
    userId: "cat",
    x: 0,
    y: 0,
    heading: 0.5,
    speed: 0,
    bend: 0,
    pose: {
      stand: 1 - (options.sleep ?? 0),
      sit: 0,
      sleep: options.sleep ?? 0,
    },
    yaw: 0,
    sniff: 0,
    legs: [a ?? fallback, b ?? fallback, c ?? fallback, d ?? fallback],
    activity: "approach",
  };
};

test("reports a print when a lifted leg is planted", () => {
  const lastHeights = { cat: [4, 0, 0, 0] };
  const landings = detectPawLandings({
    snapshots: [buildSnapshot({ heights: [0.2, 0, 0, 0] })],
    lastHeights,
  });
  assert.deepEqual(landings, [
    { kind: "pawPrint", userId: "cat", x: 0, y: 5, angle: 0.5, leg: 0 },
  ]);
  assert.deepEqual(lastHeights.cat, [0.2, 0, 0, 0]);
});

test("reports nothing for legs that stay planted or a cat seen for the first time", () => {
  const lastHeights: { [userId: string]: number[] | undefined } = {};
  assert.deepEqual(
    detectPawLandings({
      snapshots: [buildSnapshot({ heights: [0, 0, 0, 0] })],
      lastHeights,
    }),
    []
  );
  assert.deepEqual(
    detectPawLandings({
      snapshots: [buildSnapshot({ heights: [0, 0, 0, 0] })],
      lastHeights,
    }),
    []
  );
});

test("skips hind legs tucked under a sleeping cat", () => {
  const lastHeights = { cat: [0, 0, 4, 0] };
  const landings = detectPawLandings({
    snapshots: [buildSnapshot({ heights: [0, 0, 0.1, 0], sleep: 1 })],
    lastHeights,
  });
  assert.deepEqual(landings, []);
});
