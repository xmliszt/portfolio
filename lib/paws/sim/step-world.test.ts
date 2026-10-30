import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";

import { buildLook } from "./testing/build-look";
import { buildSnapshot } from "./testing/build-snapshot";
import { runWorld } from "./testing/run-world";
import { createSeededRandom } from "./create-seeded-random";
import { createWorld } from "./create-world";
import { createWorldFromSnapshots } from "./create-world-from-snapshots";
import { getCatSnapshots } from "./get-cat-snapshots";

const players = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    userId: `player-${i}`,
    look: buildLook({ size: i % 2 === 0 ? "small" : "large" }),
  }));

test("the same seed gives the same room", () => {
  const run = () => {
    const world = createWorld({ random: createSeededRandom({ seed: 7 }) });
    const events = runWorld({
      world,
      players: players(4),
      fingers: (current) => [
        {
          userId: "player-0",
          x: 800 + Math.sin(current.time) * 200,
          y: 500,
          pressed: current.time % 6 > 4,
        },
      ],
      seconds: 30,
    });
    return { snapshots: getCatSnapshots(world), events };
  };
  assert.deepEqual(run(), run());
});

test("a new player's cat walks in from past an edge", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 3 }) });
  runWorld({ world, players: players(1), seconds: 1 / 60 });
  const cat = world.cats["player-0"];
  const isOutside =
    cat.x < 0 || cat.x > world.width || cat.y < 0 || cat.y > world.height;
  assert.ok(isOutside, `starts at ${cat.x}, ${cat.y}`);
  runWorld({ world, players: players(1), seconds: 8 });
  const after = world.cats["player-0"];
  assert.ok(
    after.x > 0 &&
      after.x < world.width &&
      after.y > 0 &&
      after.y < world.height,
    "walks onto the glass"
  );
});

test("a departed player's cat walks off and is removed", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 4 }) });
  runWorld({ world, players: players(2), seconds: 10 });
  runWorld({ world, players: players(1), seconds: 0.1 });
  assert.equal(world.cats["player-1"]?.state, "leave");
  runWorld({ world, players: players(1), seconds: 30 });
  assert.equal(world.cats["player-1"], undefined);
  assert.ok(world.cats["player-0"] !== undefined, "keeps the other cat");
});

test("never more than the curious cap attend the fingers, and each gets bored", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 11 }) });
  const room = players(8);
  const curiousSince: { [userId: string]: number } = {};
  const spans: number[] = [];
  runWorld({
    world,
    players: room,
    fingers: [
      { userId: "player-0", x: 600, y: 500, pressed: false },
      { userId: "player-1", x: 1000, y: 500, pressed: false },
    ],
    seconds: 120,
    onStep: (current) => {
      const curious = Object.values(current.cats).filter(
        (cat) => cat.focusId !== undefined
      );
      assert.ok(
        curious.length <= ROOM_LIMITS.maxCuriousCats,
        `${curious.length} curious at ${current.time}`
      );
      for (const cat of Object.values(current.cats)) {
        const since = curiousSince[cat.userId];
        if (cat.focusId !== undefined && since === undefined)
          curiousSince[cat.userId] = current.time;
        if (cat.focusId === undefined && since !== undefined) {
          spans.push(current.time - since);
          delete curiousSince[cat.userId];
        }
      }
    },
  });
  assert.ok(spans.length >= 3, `${spans.length} spans of curiosity ended`);
  for (const span of spans) assert.ok(span <= 25.1, `curious for ${span} s`);
});

test("a press puts a paw on that finger, not on another one", () => {
  const world = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 5 }),
    snapshots: [buildSnapshot({ userId: "a", x: 800, y: 500, heading: 0 })],
    players: [{ userId: "a", look: buildLook() }],
  });
  const pressing = { userId: "b", x: 870, y: 500, pressed: true };
  const hovering = { userId: "c", x: 700, y: 650, pressed: false };
  const events = runWorld({
    world,
    players: [{ userId: "a", look: buildLook() }],
    fingers: [pressing, hovering],
    seconds: 3,
  });
  const cat = world.cats.a;
  const reaching = cat.legs.filter((leg) => leg.reach !== undefined);
  assert.equal(reaching.length, 1);
  assert.deepEqual(reaching[0].reach?.target, { kind: "finger", userId: "b" });
  assert.ok(
    Math.hypot(reaching[0].x - pressing.x, reaching[0].y - pressing.y) < 12,
    "paw rests on the finger"
  );
  assert.ok(
    events.some((event) => event.kind === "sound" && event.sound === "trill"),
    "trills when the paw lands"
  );
});

test("two players pressing in reach of one cat each get a front paw", () => {
  const world = createWorldFromSnapshots({
    random: createSeededRandom({ seed: 9 }),
    snapshots: [
      buildSnapshot({
        userId: "a",
        x: 800,
        y: 500,
        pose: { stand: 0, sit: 1, sleep: 0 },
        activity: "sit",
      }),
    ],
    players: [{ userId: "a", look: buildLook() }],
  });
  const left = { userId: "b", x: 858, y: 470, pressed: true };
  const right = { userId: "c", x: 858, y: 530, pressed: true };
  runWorld({
    world,
    players: [{ userId: "a", look: buildLook() }],
    fingers: [left, right],
    seconds: 3,
  });
  const cat = world.cats.a;
  assert.deepEqual(cat.pawFingerIds.toSorted(), ["b", "c"]);
  assert.deepEqual(cat.legs[0].reach?.target, { kind: "finger", userId: "b" });
  assert.deepEqual(cat.legs[1].reach?.target, { kind: "finger", userId: "c" });
  assert.ok(
    Math.hypot(cat.legs[0].x - left.x, cat.legs[0].y - left.y) < 12,
    "left paw on the left finger"
  );
  assert.ok(
    Math.hypot(cat.legs[1].x - right.x, cat.legs[1].y - right.y) < 12,
    "right paw on the right finger"
  );
});

test("social cats greet with a meow and a nose print", () => {
  const world = createWorld({ random: createSeededRandom({ seed: 21 }) });
  const events = runWorld({ world, players: players(6), seconds: 180 });
  assert.ok(
    events.some((event) => event.kind === "sound" && event.sound === "meow"),
    "meows"
  );
  assert.ok(
    events.some((event) => event.kind === "nosePrint"),
    "leaves a nose print"
  );
  assert.ok(
    events.some((event) => event.kind === "pawPrint"),
    "leaves paw prints"
  );
});
