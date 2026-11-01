import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import { parseCatsMessage } from "./parse-cats-message";
import { WIRE_LIMITS } from "./wire-limits";

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
    prints: [],
    toys: [],
  });
});

test("reads the host's toys and drops malformed ones", () => {
  const parsed = parseCatsMessage({
    hostId: "h",
    sentAt: 5,
    cats: [],
    toys: [
      {
        kind: "yarn",
        id: "yarn",
        x: 10,
        y: 20,
        h: 3,
        angle: 0,
        spin: 2,
        left: 1.5,
        fade: 0,
      },
      {
        kind: "roll",
        id: "roll",
        x: 1e6,
        y: 20,
        h: 0,
        angle: 1,
        spin: 0,
        isStanding: false,
        unrolled: 300,
        fade: 0.25,
      },
      {
        kind: "bowl",
        id: "bowl",
        x: 5,
        y: 5,
        h: 0,
        angle: 0,
        spin: 0,
        spill: { x: 40, y: 50, seconds: 12 },
      },
      { kind: "ball", id: "ball", x: 1, y: 1, h: 0, angle: 0, spin: 0 },
      { kind: "roll", id: "roll2", x: 1, y: 1, h: 0, angle: 0, spin: 0 },
    ],
  });
  assert.deepEqual(parsed?.toys, [
    {
      kind: "yarn",
      id: "yarn",
      x: 10,
      y: 20,
      h: 3,
      angle: 0,
      spin: 2,
      left: 1,
      fade: 0,
    },
    {
      kind: "roll",
      id: "roll",
      x: WIRE_LIMITS.maxX,
      y: 20,
      h: 0,
      angle: 1,
      spin: 0,
      isStanding: false,
      unrolled: 300,
      fade: 0.25,
    },
    {
      kind: "bowl",
      id: "bowl",
      x: 5,
      y: 5,
      h: 0,
      angle: 0,
      spin: 0,
      spill: { x: 40, y: 50, seconds: 12 },
    },
  ]);
});

test("keeps only the paw prints among the host's prints", () => {
  const print = {
    kind: "pawPrint",
    userId: "a",
    x: 10,
    y: 20,
    angle: 1,
    leg: 2,
  };
  const parsed = parseCatsMessage({
    hostId: "h",
    sentAt: 5,
    cats: [],
    prints: [print, { kind: "sound", userId: "a", sound: "meow" }, "junk"],
  });
  assert.deepEqual(parsed?.prints, [print]);
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

test("keeps at most one cat per player slot and resident", () => {
  const cats = Array.from({ length: 50 }, (_, index) =>
    buildCat({ userId: `u${index}` })
  );
  assert.equal(
    parseCatsMessage({ hostId: "h", sentAt: 1, cats })?.cats.length,
    ROOM_LIMITS.maxPlayers + ROOM_LIMITS.residentCats
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

test("reads toy trails when the message carries them and leaves them out when it does not", () => {
  const withTrails = parseCatsMessage({
    hostId: "h",
    sentAt: 5,
    cats: [],
    trails: [
      {
        toyId: "yarn-1",
        points: [
          [10, 20],
          [1e6, 30],
          ["x", 1],
        ],
      },
      { toyId: 7, points: [] },
    ],
  });
  assert.deepEqual(withTrails?.trails, [
    {
      toyId: "yarn-1",
      points: [
        [10, 20],
        [WIRE_LIMITS.maxX, 30],
      ],
    },
  ]);
  const without = parseCatsMessage({ hostId: "h", sentAt: 5, cats: [] });
  assert.equal(without !== undefined && "trails" in without, false);
});
