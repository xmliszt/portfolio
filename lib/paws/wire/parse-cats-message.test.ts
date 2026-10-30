import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCatsMessage } from "./parse-cats-message";

function buildCat(options: { userId: string }) {
  return {
    userId: options.userId,
    x: 100,
    y: 200,
    heading: 1,
    speed: 30,
    bend: 0.2,
    pose: { stand: 1, sit: 0, sleep: 0 },
    yaw: 0,
    sniff: 0,
    legs: [
      { x: 90, y: 190, h: 0 },
      { x: 110, y: 190, h: 2 },
      { x: 90, y: 210, h: 0 },
      { x: 110, y: 210, h: 1 },
    ],
    activity: "approach",
  };
}

test("reads the host's cats", () => {
  const cat = buildCat({ userId: "a" });
  assert.deepEqual(parseCatsMessage({ hostId: "h", sentAt: 5, cats: [cat] }), {
    hostId: "h",
    sentAt: 5,
    cats: [cat],
  });
});

test("clamps numbers and drops malformed cats", () => {
  const parsed = parseCatsMessage({
    hostId: "h",
    sentAt: 5,
    cats: [
      {
        ...buildCat({ userId: "a" }),
        x: 1e6,
        pose: { stand: 2, sit: -1, sleep: 0 },
      },
      { ...buildCat({ userId: "b" }), activity: "fly" },
      { ...buildCat({ userId: "c" }), legs: [{ x: 1, y: 1, h: 0 }] },
    ],
  });
  assert.equal(parsed?.cats.length, 1);
  assert.equal(parsed?.cats.at(0)?.x, 1800);
  assert.deepEqual(parsed?.cats.at(0)?.pose, { stand: 1, sit: 0, sleep: 0 });
});

test("keeps at most one cat per player slot", () => {
  const cats = Array.from({ length: 50 }, (_, index) =>
    buildCat({ userId: `u${index}` })
  );
  assert.equal(
    parseCatsMessage({ hostId: "h", sentAt: 1, cats })?.cats.length,
    10
  );
});

test("drops a message without a host, time or cats list", () => {
  assert.equal(parseCatsMessage({ sentAt: 1, cats: [] }), undefined);
  assert.equal(parseCatsMessage({ hostId: "h", cats: [] }), undefined);
  assert.equal(
    parseCatsMessage({ hostId: "h", sentAt: 1, cats: "none" }),
    undefined
  );
});
