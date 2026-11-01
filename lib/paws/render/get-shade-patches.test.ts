import assert from "node:assert/strict";
import { test } from "node:test";

import { getSky } from "@/lib/paws/sky/get-sky";

import { getShadePatches } from "./get-shade-patches";

const SIZE = { width: 1600, height: 1000 };
const skyAt = (hour: number) =>
  getSky({
    date: new Date(2026, 6, 15, hour, 0, 0),
    latitude: 40,
    override: { hour, season: "summer", weather: "clear" },
  });

test("the same seed and time give the same patches", () => {
  const options = { seed: 0.37, time: 90, sky: skyAt(12), ...SIZE };
  assert.deepEqual(getShadePatches(options), getShadePatches(options));
});

test("patches drift over minutes, never faster than a few pixels between repaints", () => {
  const sky = skyAt(12);
  const at = (time: number) =>
    getShadePatches({ seed: 0.37, time, sky, ...SIZE });
  for (let time = 0; time < 600; time += 0.25) {
    for (const [i, patch] of at(time).entries()) {
      const next = at(time + 0.25)[i];
      const isHidden = Math.min(patch.strength, next.strength) < 0.001;
      assert.ok(
        isHidden || Math.hypot(next.x - patch.x, next.y - patch.y) < 1.5,
        `patch ${i} jumps at ${time} s`
      );
    }
  }
  const moved = at(0).some((patch, i) => {
    const later = at(120)[i];
    return Math.hypot(later.x - patch.x, later.y - patch.y) > 40;
  });
  assert.ok(moved, "no patch moved in two minutes");
});

test("a patch fades out and comes back somewhere else", () => {
  const sky = skyAt(12);
  const first = (time: number) => {
    const patch = getShadePatches({ seed: 0.37, time, sky, ...SIZE }).at(0);
    assert.ok(patch !== undefined);
    return patch;
  };
  const gone = Array.from({ length: 1200 }, (_, second) => second).find(
    (second) => second > 0 && first(second).strength < 0.001
  );
  assert.ok(gone !== undefined, "the patch never faded out");
  const before = first(gone - 30);
  const after = first(gone + 30);
  assert.ok(
    Math.hypot(after.x - before.x, after.y - before.y) > 50,
    "the patch came back in the same place"
  );
});

test("a low evening sun pushes the shade away from it and thins it at night", () => {
  const mean = (hour: number) => {
    const patches = getShadePatches({
      seed: 0.37,
      time: 0,
      sky: skyAt(hour),
      ...SIZE,
    });
    return {
      x: patches.reduce((sum, patch) => sum + patch.x, 0) / patches.length,
      strength: patches.reduce((sum, patch) => sum + patch.strength, 0),
    };
  };
  assert.ok(mean(19).x < mean(12).x - 100, "evening shade does not move away");
  assert.ok(
    mean(1).strength < mean(12).strength * 0.6,
    "night shade is not thinner"
  );
});
