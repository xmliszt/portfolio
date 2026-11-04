import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { buildSnapshot } from "@/lib/paws/sim/testing/build-snapshot";
import { parseCatsMessage } from "@/lib/paws/wire/parse-cats-message";
import type { PlayerPresence } from "@/lib/paws/wire-types";

import { createRoomEngine } from "./create-room-engine";

const DT_SECONDS = 1 / 60;

function buildPlayer(options: {
  userId: string;
  joinedAt: number;
}): PlayerPresence {
  return {
    userId: options.userId,
    connectionId: `${options.userId}-tab`,
    joinedAt: options.joinedAt,
    look: {
      coat: "ginger",
      pattern: "solid",
      belly: "cream",
      pads: "pink",
      size: "small",
      fluff: "small",
      tail: "small",
      tailShape: "slim",
      ears: "small",
    },
    voice: { age: "adult", voice: "soft", mood: "chatty" },
  };
}

function buildFollower() {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 1 }) });
  engine.setPlayers([
    buildPlayer({ userId: "host", joinedAt: 1 }),
    buildPlayer({ userId: "me", joinedAt: 2 }),
  ]);
  engine.setSelf({
    userId: "me",
    connectionId: "me-tab",
    role: "player",
    roomId: "room-1",
  });
  return engine;
}

test("shows the host's prints of a reaching paw once the render delay has passed", () => {
  const engine = buildFollower();
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: 0,
      cats: [
        buildSnapshot({ userId: "host", x: 100, y: 100, activity: "paw" }),
      ],
      prints: [
        { kind: "pawPrint", userId: "host", x: 100, y: 100, angle: 0, leg: 0 },
      ],
      toys: [],
    },
    receivedAtMs: 1000,
  });
  const early = engine.frame({
    nowMs: 1000 + ROOM_LIMITS.renderDelayMs - 1,
    dtSeconds: DT_SECONDS,
  });
  assert.equal(early.prints.length, 0, "print waits for the render delay");
  const due = engine.frame({
    nowMs: 1000 + ROOM_LIMITS.renderDelayMs,
    dtSeconds: DT_SECONDS,
  });
  assert.equal(due.prints.length, 1, "print shows after the render delay");
});

test("drops the host's footfall prints, since this screen steps the legs itself", () => {
  const engine = buildFollower();
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: 0,
      cats: [buildSnapshot({ userId: "host", x: 100, y: 100 })],
      prints: [
        { kind: "pawPrint", userId: "host", x: 100, y: 100, angle: 0, leg: 0 },
      ],
      toys: [],
    },
    receivedAtMs: 1000,
  });
  const due = engine.frame({
    nowMs: 1000 + ROOM_LIMITS.renderDelayMs,
    dtSeconds: DT_SECONDS,
  });
  assert.equal(due.prints.length, 0);
});

function walkingHost(options: { x: number; activity?: "paw" | "pause" }) {
  return {
    ...buildSnapshot({
      userId: "host",
      x: options.x,
      y: 500,
      activity: options.activity ?? "approach",
    }),
    speed: options.activity === undefined ? 300 : 0,
  };
}

test("prints a walking cat's footfalls from the legs this screen steps", () => {
  const engine = buildFollower();
  const sendMs = 1000 / ROOM_LIMITS.catSnapshotsPerSecond;
  Array.from({ length: 12 }, (_, index) =>
    engine.receiveCats({
      message: {
        hostId: "host-tab",
        sentAt: index * sendMs,
        cats: [walkingHost({ x: 300 + index * 75 })],
        prints: [],
        toys: [],
      },
      receivedAtMs: 1000 + index * sendMs,
    })
  );
  const prints = Array.from({ length: 150 }, (_, frame) =>
    engine.frame({
      nowMs: 1000 + frame * 1000 * DT_SECONDS,
      dtSeconds: DT_SECONDS,
    })
  ).at(-1)?.prints;
  assert.ok((prints?.length ?? 0) > 2, `${prints?.length} prints`);
});

test("keeps the host's print of a paw sent as the cat stops pawing", () => {
  const engine = buildFollower();
  const sendMs = 1000 / ROOM_LIMITS.catSnapshotsPerSecond;
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: 0,
      cats: [walkingHost({ x: 500, activity: "paw" })],
      prints: [],
      toys: [],
    },
    receivedAtMs: 1000,
  });
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: sendMs,
      cats: [walkingHost({ x: 500, activity: "pause" })],
      prints: [
        { kind: "pawPrint", userId: "host", x: 560, y: 500, angle: 0, leg: 0 },
      ],
      toys: [],
    },
    receivedAtMs: 1000 + sendMs,
  });
  const frames = Array.from({ length: 60 }, (_, frame) =>
    engine.frame({
      nowMs: 1000 + frame * 1000 * DT_SECONDS,
      dtSeconds: DT_SECONDS,
    })
  );
  assert.ok(
    frames.at(-1)?.prints.some((print) => print.x === 560),
    "the paw's print shows"
  );
});

test("ignores cat messages from a connection that is not the host", () => {
  const engine = buildFollower();
  engine.receiveCats({
    message: {
      hostId: "me-tab",
      sentAt: 0,
      cats: [],
      prints: [
        { kind: "pawPrint", userId: "host", x: 1, y: 1, angle: 0, leg: 0 },
      ],
      toys: [],
    },
    receivedAtMs: 0,
  });
  const frame = engine.frame({ nowMs: 10_000, dtSeconds: DT_SECONDS });
  assert.equal(frame.prints.length, 0);
});

test("sends a release when a pressed fingertip leaves", () => {
  const engine = buildFollower();
  engine.setOwnPointer({ x: 50, y: 60, present: true, pressed: true });
  assert.equal(
    engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS }).outgoing.finger?.pressed,
    true
  );
  engine.setOwnPointer({ x: 50, y: 60, present: false, pressed: false });
  const released = engine.frame({ nowMs: 16, dtSeconds: DT_SECONDS }).outgoing
    .finger;
  assert.deepEqual(
    { x: released?.x, y: released?.y, pressed: released?.pressed },
    { x: 50, y: 60, pressed: false }
  );
  assert.equal(
    engine.frame({ nowMs: 32, dtSeconds: DT_SECONDS }).outgoing.finger,
    undefined,
    "nothing more is sent once released"
  );
});

test("resends a still fingertip every second", () => {
  const engine = buildFollower();
  engine.setOwnPointer({ x: 50, y: 60, present: true, pressed: false });
  const sentAt = [0, 500, 999, 1000].filter(
    (nowMs) =>
      engine.frame({ nowMs, dtSeconds: DT_SECONDS }).outgoing.finger !==
      undefined
  );
  assert.deepEqual(sentAt, [0, 1000]);
});

test("a watcher sends its fingertip with the trail since its last message", () => {
  const engine = buildFollower();
  engine.setSelf({
    userId: "me",
    connectionId: "me-tab",
    role: "watcher",
    roomId: "room-1",
  });
  const sent = Array.from({ length: 31 }, (_, index) => index * 20).flatMap(
    (nowMs) => {
      engine.setOwnPointer({
        x: nowMs / 10,
        y: 60,
        present: true,
        pressed: false,
      });
      const finger = engine.frame({ nowMs, dtSeconds: DT_SECONDS }).outgoing
        .finger;
      return finger === undefined ? [] : [finger];
    }
  );
  assert.deepEqual(
    sent.map((finger) => finger.t),
    [0, 500],
    "sends at the room's finger rate"
  );
  assert.deepEqual(
    sent[1].trail.map((point) => point[2]),
    [60, 120, 180, 240, 300, 360, 420, 480]
  );
  assert.equal(sent[1].x, 50);
});

test("plays another visitor's fingertip back along a curve behind real time", () => {
  const engine = buildFollower();
  const positions: number[] = [];
  for (let nowMs = 0; nowMs <= 2000; nowMs += 20) {
    if (nowMs % 500 === 0)
      engine.receiveFinger({
        message: {
          userId: "guest",
          x: nowMs / 5,
          y: 100,
          t: nowMs,
          trail: [100, 200, 300, 400]
            .map((step) => nowMs - 500 + step)
            .filter((t) => t > 0)
            .map((t): [number, number, number] => [t / 5, 100, t]),
          pressed: false,
          seq: nowMs,
        },
        receivedAtMs: nowMs + 40,
      });
    const remote = engine
      .frame({ nowMs: nowMs + 40, dtSeconds: DT_SECONDS })
      .fingers.find((finger) => finger.kind === "remote");
    if (nowMs >= 1000 && remote !== undefined) positions.push(remote.x);
  }
  const steps = positions.slice(1).map((x, index) => x - positions[index]);
  assert.ok(
    steps.every((step) => step > 3 && step < 5),
    `moves evenly: ${steps.map((step) => step.toFixed(1)).join(" ")}`
  );
  assert.ok(
    positions[0] < 1000 / 5 - 100,
    `plays behind the latest point: ${positions[0]}`
  );
});

function buildGuestFinger(options: {
  x: number;
  t: number;
  seq: number;
  trail?: [number, number, number][];
}) {
  return {
    userId: "guest",
    x: options.x,
    y: 100,
    t: options.t,
    trail: options.trail ?? [],
    pressed: false,
    seq: options.seq,
  };
}

function remoteX(engine: ReturnType<typeof createRoomEngine>, nowMs: number) {
  return engine
    .frame({ nowMs, dtSeconds: DT_SECONDS })
    .fingers.find((finger) => finger.kind === "remote")?.x;
}

test("follows a visitor who reloads and starts their sequence again", () => {
  const engine = buildFollower();
  engine.receiveFinger({
    message: buildGuestFinger({ x: 100, t: 120_000, seq: 50 }),
    receivedAtMs: 0,
  });
  remoteX(engine, 0);
  engine.receiveFinger({
    message: buildGuestFinger({ x: 900, t: 5, seq: 1 }),
    receivedAtMs: 1000,
  });
  assert.equal(remoteX(engine, 1000), 900);
});

test("eases playback when the delay grows, so the cursor never steps back", () => {
  const engine = buildFollower();
  const positions: number[] = [];
  for (let nowMs = 0; nowMs <= 8000; nowMs += 20) {
    if (nowMs % 500 === 0)
      engine.receiveFinger({
        message: buildGuestFinger({
          x: nowMs / 5,
          t: nowMs,
          seq: nowMs + 1,
          trail: [100, 200, 300, 400]
            .map((step) => nowMs - 500 + step)
            .filter((t) => t > 0)
            .map((t): [number, number, number] => [t / 5, 100, t]),
        }),
        receivedAtMs: nowMs + (nowMs === 0 ? 40 : 440),
      });
    const x = remoteX(engine, nowMs + 20);
    if (x !== undefined) positions.push(x);
  }
  const backwards = positions.filter(
    (x, index) => index > 0 && x < positions[index - 1] - 0.01
  );
  assert.deepEqual(backwards, []);
});

test("shows another visitor's fingerprint once their cursor gets there", () => {
  const engine = buildFollower();
  engine.receiveEvent({
    event: { kind: "fingerPrint", userId: "guest", x: 10, y: 10, pressure: 1 },
    receivedAtMs: 0,
  });
  assert.equal(
    engine.frame({ nowMs: 100, dtSeconds: DT_SECONDS }).prints.length,
    0
  );
  assert.equal(
    engine.frame({ nowMs: 1000, dtSeconds: DT_SECONDS }).prints.length,
    1
  );
});

test("a guest alone in the room plays with the resident cats", () => {
  const run = (isTouching: boolean) => {
    const engine = createRoomEngine({
      random: createSeededRandom({ seed: 2 }),
    });
    engine.setSelf({
      userId: "guest",
      connectionId: "guest-tab",
      role: "watcher",
      roomId: "room-1",
    });
    const cats: string[] = [];
    for (let frame = 0; frame < 900; frame++) {
      engine.setOwnPointer({
        x: 800,
        y: 500,
        present: isTouching,
        pressed: false,
      });
      const room = engine.frame({ nowMs: frame * 16, dtSeconds: DT_SECONDS });
      if (frame === 899)
        cats.push(
          ...room.cats.map((cat) => `${cat.x.toFixed(1)},${cat.y.toFixed(1)}`)
        );
    }
    return cats;
  };
  assert.notDeepEqual(run(true), run(false));
});

test("a visitor who is not signed in still plays with the resident cats", () => {
  const run = (isTouching: boolean) => {
    const engine = createRoomEngine({
      random: createSeededRandom({ seed: 2 }),
    });
    const cats: string[] = [];
    for (let frame = 0; frame < 900; frame++) {
      engine.setOwnPointer({
        x: 800,
        y: 500,
        present: isTouching,
        pressed: false,
      });
      const room = engine.frame({ nowMs: frame * 16, dtSeconds: DT_SECONDS });
      if (frame === 899)
        cats.push(
          ...room.cats.map((cat) => `${cat.x.toFixed(1)},${cat.y.toFixed(1)}`)
        );
    }
    return cats;
  };
  assert.notDeepEqual(run(true), run(false));
});

test("the host runs the room's resident cats alongside the players' cats and sends them", () => {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 3 }) });
  engine.setPlayers([buildPlayer({ userId: "me", joinedAt: 1 })]);
  engine.setSelf({
    userId: "me",
    connectionId: "me-tab",
    role: "player",
    roomId: "room-1",
  });
  const listening = engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  assert.equal(listening.isHost, false, "listens for a running host first");
  const room = engine.frame({ nowMs: 1000, dtSeconds: DT_SECONDS });
  assert.equal(room.isHost, true);
  assert.deepEqual(
    room.outgoing.cats?.cats.map((cat) => cat.userId).toSorted(),
    ["me", "resident-1", "resident-2", "resident-3"],
    "the residents stay when a player brings a cat"
  );
});

test("every screen in a room gets the same residents, and another room gets different ones", () => {
  const residentsOf = (options: { seed: number; roomId: string }) => {
    const engine = createRoomEngine({
      random: createSeededRandom({ seed: options.seed }),
    });
    engine.setSelf({
      userId: "guest",
      connectionId: "guest-tab",
      role: "watcher",
      roomId: options.roomId,
    });
    return engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS }).residents;
  };
  assert.deepEqual(
    residentsOf({ seed: 1, roomId: "room-1" }),
    residentsOf({ seed: 2, roomId: "room-1" })
  );
  assert.notDeepEqual(
    residentsOf({ seed: 1, roomId: "room-1" }),
    residentsOf({ seed: 1, roomId: "room-2" })
  );
});

test("other screens receive every cat of a full room, residents included", () => {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 4 }) });
  engine.setSelf({
    userId: "p1",
    connectionId: "p1-tab",
    role: "player",
    roomId: "room-1",
  });
  engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  engine.setPlayers(
    Array.from({ length: ROOM_LIMITS.maxPlayers }, (_, index) =>
      buildPlayer({ userId: `p${index + 1}`, joinedAt: index + 1 })
    )
  );
  const sent = Array.from({ length: 600 }, (_, frame) =>
    engine.frame({ nowMs: (frame + 1) * 16, dtSeconds: DT_SECONDS })
  ).findLast((room) => room.outgoing.cats !== undefined)?.outgoing.cats;
  const received = parseCatsMessage(JSON.parse(JSON.stringify(sent)));
  assert.equal(
    received?.cats.length,
    ROOM_LIMITS.maxPlayers + ROOM_LIMITS.residentCats
  );
});

test("resident cats make sounds that resolve to a resident's voice", () => {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 2 }) });
  engine.setSelf({
    userId: "guest",
    connectionId: "guest-tab",
    role: "watcher",
    roomId: "room-1",
  });
  const isResidentSoundHeard = Array.from({ length: 3600 }, (_, frame) => {
    engine.setOwnPointer({
      x: 800,
      y: 500,
      present: true,
      pressed: Math.floor(frame / 60) % 2 === 0,
    });
    return engine.frame({ nowMs: frame * 16, dtSeconds: DT_SECONDS });
  }).some((room) =>
    room.sounds.some((sound) =>
      room.residents.some((resident) => resident.userId === sound.userId)
    )
  );
  assert.equal(isResidentSoundHeard, true);
});

function runHost(options: { roomId: string }) {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 1 }) });
  engine.setPlayers([buildPlayer({ userId: "a", joinedAt: 1 })]);
  engine.setSelf({
    userId: "a",
    connectionId: "a-tab",
    role: "player",
    roomId: options.roomId,
  });
  return Array.from({ length: 600 }, (_, frame) =>
    engine.frame({ nowMs: frame * 16, dtSeconds: DT_SECONDS })
  ).findLast((room) => room.outgoing.cats !== undefined)?.outgoing.cats;
}

test("a visitor who becomes host keeps the residents where their screen had them", () => {
  const lastHostMessage = runHost({ roomId: "room-1" });
  assert.ok(lastHostMessage);
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 2 }) });
  engine.setPlayers([buildPlayer({ userId: "a", joinedAt: 1 })]);
  engine.setSelf({
    userId: "b",
    connectionId: "b-tab",
    role: "watcher",
    roomId: "room-1",
  });
  engine.receiveCats({ message: lastHostMessage, receivedAtMs: 0 });
  engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  engine.setPlayers([]);
  engine.setOwnPointer({ x: 1500, y: 800, present: true, pressed: false });
  const alone = Array.from({ length: 3600 }, (_, frame) =>
    engine.frame({ nowMs: (frame + 1) * 16, dtSeconds: DT_SECONDS })
  ).at(-1);
  const before = alone?.cats.find((cat) => cat.userId === "resident-1");
  engine.setPlayers([buildPlayer({ userId: "b", joinedAt: 5 })]);
  engine.setSelf({
    userId: "b",
    connectionId: "b-tab",
    role: "player",
    roomId: "room-1",
  });
  const after = engine
    .frame({ nowMs: 3602 * 16, dtSeconds: DT_SECONDS })
    .cats.find((cat) => cat.userId === "resident-1");
  assert.ok(before && after);
  assert.ok(Math.abs(after.x - before.x) < 5, `${before.x} -> ${after.x}`);
});

test("a new room's residents do not start from the last room's snapshots", () => {
  const lastHostMessage = runHost({ roomId: "room-1" });
  const old = lastHostMessage?.cats.find((cat) => cat.userId === "resident-1");
  assert.ok(lastHostMessage && old);
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 2 }) });
  engine.setPlayers([buildPlayer({ userId: "a", joinedAt: 1 })]);
  engine.setSelf({
    userId: "b",
    connectionId: "b-tab",
    role: "watcher",
    roomId: "room-1",
  });
  engine.receiveCats({ message: lastHostMessage, receivedAtMs: 0 });
  engine.setPlayers([]);
  engine.setSelf({
    userId: "b",
    connectionId: "b-tab",
    role: "watcher",
    roomId: "room-2",
  });
  const fresh = engine
    .frame({ nowMs: 16, dtSeconds: DT_SECONDS })
    .cats.find((cat) => cat.userId === "resident-1");
  assert.ok(
    fresh === undefined || Math.hypot(fresh.x - old.x, fresh.y - old.y) > 1
  );
});

test("a screen whose host goes silent runs the room's cats itself", () => {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 4 }) });
  engine.setPlayers([buildPlayer({ userId: "a", joinedAt: 1 })]);
  engine.setSelf({
    userId: "b",
    connectionId: "b-tab",
    role: "watcher",
    roomId: "room-1",
  });
  const waiting = engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  assert.equal(waiting.cats.length, 0, "waits for the host at first");
  const silent = engine.frame({ nowMs: 3100, dtSeconds: DT_SECONDS });
  assert.deepEqual(
    silent.cats.map((cat) => cat.userId).toSorted(),
    ["a", "resident-1", "resident-2", "resident-3"],
    "after 3 s of silence it shows the player's cat and the residents"
  );
});

test("resumes a laggy visitor's fingertip where it stopped instead of jumping to catch up", () => {
  const engine = buildFollower();
  const lagFromMs = 2000;
  const lagToMs = 3500;
  const messages = Array.from({ length: 12 }, (_, i) => (i + 1) * 500).map(
    (sentMs) => ({
      message: buildGuestFinger({
        x: sentMs / 2,
        t: sentMs,
        seq: sentMs,
        trail: [100, 200, 300, 400].map((step): [number, number, number] => [
          (sentMs - 500 + step) / 2,
          100,
          sentMs - 500 + step,
        ]),
      }),
      receivedAtMs:
        sentMs > lagFromMs && sentMs <= lagToMs ? lagToMs : sentMs + 40,
    })
  );
  const positions: number[] = [];
  for (let nowMs = 0; nowMs <= 6500; nowMs += 16) {
    messages
      .filter(
        (entry) =>
          entry.receivedAtMs > nowMs - 16 && entry.receivedAtMs <= nowMs
      )
      .forEach((entry) => engine.receiveFinger(entry));
    const x = remoteX(engine, nowMs);
    if (x !== undefined) positions.push(x);
  }
  const steps = positions.slice(1).map((x, index) => x - positions[index]);
  const largest = Math.max(...steps);
  assert.ok(largest < 20, `largest step per frame: ${largest.toFixed(1)}`);
});

function playGuest(options: {
  deliveries: { atMs: number; message: ReturnType<typeof buildGuestFinger> }[];
  endMs: number;
}) {
  const engine = buildFollower();
  const positions: { nowMs: number; x: number }[] = [];
  for (let nowMs = 0; nowMs <= options.endMs; nowMs += 16) {
    options.deliveries
      .filter((entry) => entry.atMs > nowMs - 16 && entry.atMs <= nowMs)
      .forEach((entry) =>
        engine.receiveFinger({
          message: entry.message,
          receivedAtMs: entry.atMs,
        })
      );
    const x = remoteX(engine, nowMs);
    if (x !== undefined) positions.push({ nowMs, x });
  }
  return positions;
}

function slowStroke(options: { sentMs: number; seq: number }) {
  const x = (t: number) => 100 + t * 0.04;
  return buildGuestFinger({
    x: x(options.sentMs),
    t: options.sentMs,
    seq: options.seq,
    trail:
      options.sentMs <= 500
        ? []
        : [100, 200, 300, 400].map((step): [number, number, number] => [
            x(options.sentMs - 500 + step),
            100,
            options.sentMs - 500 + step,
          ]),
  });
}

test("never steps a slow fingertip back when two late batches follow each other", () => {
  const positions = playGuest({
    deliveries: [
      { atMs: 540, message: slowStroke({ sentMs: 500, seq: 1 }) },
      { atMs: 1040, message: slowStroke({ sentMs: 1000, seq: 2 }) },
      { atMs: 2400, message: slowStroke({ sentMs: 1500, seq: 3 }) },
      { atMs: 2900, message: slowStroke({ sentMs: 2000, seq: 4 }) },
      { atMs: 3040, message: slowStroke({ sentMs: 2500, seq: 5 }) },
    ],
    endMs: 4000,
  });
  const backwards = positions.filter(
    (position, index) =>
      index > 0 && position.x < (positions[index - 1]?.x ?? 0) - 0.01
  );
  assert.deepEqual(backwards, []);
});

test("steps a lifted fingertip straight to its next touch instead of gliding there", () => {
  const positions = playGuest({
    deliveries: [
      {
        atMs: 1040,
        message: buildGuestFinger({ x: 100, t: 1000, seq: 1 }),
      },
      {
        atMs: 2540,
        message: buildGuestFinger({ x: 900, t: 2500, seq: 2 }),
      },
    ],
    endMs: 4500,
  });
  const between = positions.filter(
    (position) => position.x > 150 && position.x < 850
  );
  assert.deepEqual(between, []);
  assert.equal(positions.at(-1)?.x, 900);
});

function buildHost() {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 7 }) });
  engine.setPlayers([buildPlayer({ userId: "me", joinedAt: 1 })]);
  engine.setSelf({
    userId: "me",
    connectionId: "me-tab",
    role: "player",
    roomId: "room-1",
  });
  return engine;
}

test("the host puts a placed toy straight into the room and sends it with its trail", () => {
  const engine = buildHost();
  engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  engine.placeToy({ itemId: "yarn-2", x: 600, y: 500, nowMs: 10 });
  const room = engine.frame({ nowMs: 1000, dtSeconds: DT_SECONDS });
  assert.ok(room.toys.some((toy) => toy.id === "yarn-2"));
  assert.deepEqual(room.pendingItemIds, []);
  assert.ok(room.outgoing.cats?.toys.some((toy) => toy.id === "yarn-2"));
  assert.ok(
    room.outgoing.cats?.trails !== undefined,
    "trails go with a new toy"
  );
  assert.equal(
    room.outgoing.events.some((event) => event.kind === "placeToy"),
    false
  );
});

test("the host sends trails about once a second, and at once when a toy comes or goes", () => {
  const engine = buildHost();
  engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  const sentAt = Array.from({ length: 240 }, (_, frame) => {
    const nowMs = 1000 + frame * (1000 / 60);
    if (frame === 150)
      engine.placeToy({ itemId: "roll-1", x: 400, y: 400, nowMs });
    const cats = engine.frame({ nowMs, dtSeconds: DT_SECONDS }).outgoing.cats;
    return cats?.trails === undefined ? [] : [Math.round(nowMs)];
  }).flat();
  const gaps = sentAt.slice(1, 3).map((at, index) => at - sentAt[index]);
  assert.ok(
    gaps.every((gap) => gap >= 1000 && gap < 1100),
    `trails sent at ${sentAt.join(", ")}`
  );
  assert.ok(
    sentAt.some((at) => at >= 3500 && at < 3700),
    `no trails right after the toy came in: ${sentAt.join(", ")}`
  );
});

test("a follower asks the host to place a toy and greys it out until it shows up or 3 s pass", () => {
  const engine = buildFollower();
  engine.placeToy({ itemId: "yarn-1", x: 300, y: 300, nowMs: 0 });
  const asked = engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  assert.deepEqual(
    asked.outgoing.events.filter((event) => event.kind === "placeToy"),
    [{ kind: "placeToy", userId: "me", itemId: "yarn-1", x: 300, y: 300 }]
  );
  assert.deepEqual(asked.pendingItemIds, ["yarn-1"]);
  const later = engine.frame({ nowMs: 3100, dtSeconds: DT_SECONDS });
  assert.deepEqual(later.pendingItemIds, [], "a refused request frees the toy");
});

test("a follower draws the trail that matches the moment it draws the toys", () => {
  const engine = buildFollower();
  const yarnAt = (x: number) => ({
    kind: "yarn" as const,
    id: "yarn-1",
    x,
    y: 300,
    h: 0,
    angle: 0,
    spin: 0,
    left: 0.9,
    fade: 0,
  });
  const send = (sentAt: number, x: number, trailTo: number) =>
    engine.receiveCats({
      message: {
        hostId: "host-tab",
        sentAt,
        cats: [buildSnapshot({ userId: "host", x: 900, y: 600 })],
        prints: [],
        toys: [yarnAt(x)],
        trails: [
          {
            toyId: "yarn-1",
            points: [
              [100, 300],
              [trailTo, 300],
            ],
          },
        ],
      },
      receivedAtMs: sentAt,
    });
  send(0, 200, 200);
  send(1000, 400, 400);
  const room = engine.frame({ nowMs: 1000, dtSeconds: DT_SECONDS });
  const ball = room.toys.find((toy) => toy.id === "yarn-1");
  const trailEnd = room.trails.at(0)?.points.at(-1)?.[0];
  assert.ok(ball !== undefined && trailEnd !== undefined);
  assert.ok(
    trailEnd <= ball.x,
    `trail ends at ${trailEnd}, ahead of the ball at ${ball.x}`
  );
});

test("a new host keeps a half-used yarn ball and its trail when no cat is in sight", () => {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 4 }) });
  engine.setPlayers([
    buildPlayer({ userId: "host", joinedAt: 1 }),
    buildPlayer({ userId: "me", joinedAt: 2 }),
  ]);
  engine.setSelf({
    userId: "me",
    connectionId: "me-tab",
    role: "player",
    roomId: "room-1",
  });
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: 0,
      cats: [],
      prints: [],
      toys: [
        {
          kind: "yarn",
          id: "yarn-3",
          x: 500,
          y: 500,
          h: 0,
          angle: 0,
          spin: 0,
          left: 0.4,
          fade: 0,
        },
      ],
      trails: [
        {
          toyId: "yarn-3",
          points: [
            [300, 500],
            [500, 500],
          ],
        },
      ],
    },
    receivedAtMs: 0,
  });
  engine.setPlayers([buildPlayer({ userId: "me", joinedAt: 2 })]);
  const room = engine.frame({ nowMs: 100, dtSeconds: DT_SECONDS });
  assert.equal(room.isHost, true);
  const yarn = room.toys.find((toy) => toy.id === "yarn-3");
  assert.ok(yarn?.kind === "yarn" && Math.abs(yarn.left - 0.4) < 0.01);
  assert.deepEqual(room.trails.at(0)?.points.slice(0, 2), [
    [300, 500],
    [500, 500],
  ]);
});

function buildGuest(options: { connectionId: string; seed: number }) {
  const engine = createRoomEngine({
    random: createSeededRandom({ seed: options.seed }),
  });
  engine.setSelf({
    userId: options.connectionId.replace("-tab", ""),
    connectionId: options.connectionId,
    role: "watcher",
    roomId: "room-1",
  });
  engine.setPlayers([]);
  return engine;
}

function runGuestHost(options: { connectionId: string; frames: number }) {
  const engine = buildGuest({ connectionId: options.connectionId, seed: 5 });
  const messages = Array.from({ length: options.frames }, (_, frame) => {
    const nowMs = frame * 16;
    if (frame === 100)
      engine.placeToy({ itemId: "yarn-2", x: 600, y: 500, nowMs });
    return engine.frame({ nowMs, dtSeconds: DT_SECONDS }).outgoing.cats;
  }).flatMap((cats) => (cats === undefined ? [] : [cats]));
  return { engine, messages };
}

test("a guest alone in the room starts sending the room once it has listened", () => {
  const engine = buildGuest({ connectionId: "g-tab", seed: 5 });
  const listening = engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  assert.equal(listening.isHost, false);
  assert.equal(listening.outgoing.cats, undefined);
  const room = engine.frame({ nowMs: 1000, dtSeconds: DT_SECONDS });
  assert.equal(room.isHost, true);
  assert.ok(room.outgoing.cats?.toys.length);
});

test("a player who enters a room a guest is running carries on its toys", () => {
  const { messages } = runGuestHost({ connectionId: "g-tab", frames: 300 });
  const last = messages.at(-1);
  assert.ok(last && last.toys.some((toy) => toy.id === "yarn-2"));
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 9 }) });
  engine.setPlayers([buildPlayer({ userId: "p", joinedAt: 1 })]);
  engine.setSelf({
    userId: "p",
    connectionId: "p-tab",
    role: "player",
    roomId: "room-1",
  });
  engine.receiveCats({ message: last, receivedAtMs: 0 });
  const room = engine.frame({ nowMs: 16, dtSeconds: DT_SECONDS });
  assert.equal(room.isHost, true);
  assert.deepEqual(
    room.toys.map((toy) => toy.id).toSorted(),
    last.toys.map((toy) => toy.id).toSorted()
  );
  const yarn = room.toys.find((toy) => toy.id === "yarn-2");
  const sentYarn = last.toys.find((toy) => toy.id === "yarn-2");
  assert.ok(yarn && sentYarn);
  assert.ok(Math.hypot(yarn.x - sentYarn.x, yarn.y - sentYarn.y) < 5);
});

test("a guest running the room keeps it until the arriving player's cats come in", () => {
  const { engine } = runGuestHost({ connectionId: "g-tab", frames: 100 });
  engine.setPlayers([buildPlayer({ userId: "p", joinedAt: 1 })]);
  const waiting = engine.frame({ nowMs: 1700, dtSeconds: DT_SECONDS });
  assert.equal(waiting.isHost, true);
  engine.receiveCats({
    message: { hostId: "p-tab", sentAt: 0, cats: [], prints: [], toys: [] },
    receivedAtMs: 1710,
  });
  const following = engine.frame({ nowMs: 1720, dtSeconds: DT_SECONDS });
  assert.equal(following.isHost, false);
});

test("of two guests running a room, the larger connection id gives way", () => {
  const smaller = runGuestHost({ connectionId: "a-tab", frames: 100 });
  const larger = runGuestHost({ connectionId: "b-tab", frames: 100 });
  const fromSmaller = smaller.messages.at(-1);
  const fromLarger = larger.messages.at(-1);
  assert.ok(fromSmaller && fromLarger);
  smaller.engine.receiveCats({ message: fromLarger, receivedAtMs: 1600 });
  larger.engine.receiveCats({ message: fromSmaller, receivedAtMs: 1600 });
  assert.equal(
    smaller.engine.frame({ nowMs: 1616, dtSeconds: DT_SECONDS }).isHost,
    true
  );
  assert.equal(
    larger.engine.frame({ nowMs: 1616, dtSeconds: DT_SECONDS }).isHost,
    false
  );
});

test("a guest who enters a room another guest is running follows it", () => {
  const { messages } = runGuestHost({ connectionId: "g-tab", frames: 300 });
  const engine = buildGuest({ connectionId: "z-tab", seed: 6 });
  const tail = messages.slice(-6);
  const rooms = Array.from({ length: 90 }, (_, frame) => {
    const nowMs = frame * 16;
    const message = tail[frame / 15];
    if (frame % 15 === 0 && message !== undefined)
      engine.receiveCats({ message, receivedAtMs: nowMs });
    return engine.frame({ nowMs, dtSeconds: DT_SECONDS });
  });
  assert.ok(rooms.every((room) => !room.isHost));
  assert.ok(rooms.at(-1)?.toys.some((toy) => toy.id === "yarn-2"));
});

test("a screen starts listening only once the room's presence has synced", () => {
  const engine = createRoomEngine({ random: createSeededRandom({ seed: 9 }) });
  engine.setSelf({
    userId: "p",
    connectionId: "p-tab",
    role: "player",
    roomId: "room-1",
  });
  const beforeSync = engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  assert.equal(beforeSync.isHost, false);
  engine.setPlayers([buildPlayer({ userId: "p", joinedAt: 1 })]);
  const synced = engine.frame({ nowMs: 1500, dtSeconds: DT_SECONDS });
  assert.equal(
    synced.isHost,
    false,
    "1 s after setSelf is not 1 s of listening"
  );
  const listened = engine.frame({ nowMs: 2500, dtSeconds: DT_SECONDS });
  assert.equal(listened.isHost, true);
});

test("a guest that rejoins the same room listens again before running it", () => {
  const { engine } = runGuestHost({ connectionId: "g-tab", frames: 100 });
  engine.setSelf({
    userId: "g",
    connectionId: undefined,
    role: "watcher",
    roomId: undefined,
  });
  engine.frame({ nowMs: 1600, dtSeconds: DT_SECONDS });
  engine.setSelf({
    userId: "g",
    connectionId: "g2-tab",
    role: "watcher",
    roomId: "room-1",
  });
  engine.setPlayers([]);
  const rejoined = engine.frame({ nowMs: 1616, dtSeconds: DT_SECONDS });
  assert.equal(rejoined.isHost, false);
});

test("guests keep a leaving player's toys and one of them sends them on", () => {
  const host = buildHost();
  host.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  host.placeToy({ itemId: "yarn-2", x: 600, y: 500, nowMs: 10 });
  const fromPlayer = Array.from({ length: 120 }, (_, frame) =>
    host.frame({ nowMs: 1000 + frame * 16, dtSeconds: DT_SECONDS })
  )
    .flatMap((room) =>
      room.outgoing.cats === undefined ? [] : [room.outgoing.cats]
    )
    .at(-1);
  assert.ok(fromPlayer && fromPlayer.toys.some((toy) => toy.id === "yarn-2"));
  const guest = createRoomEngine({ random: createSeededRandom({ seed: 3 }) });
  guest.setSelf({
    userId: "g",
    connectionId: "g-tab",
    role: "watcher",
    roomId: "room-1",
  });
  guest.setPlayers([buildPlayer({ userId: "me", joinedAt: 1 })]);
  guest.receiveCats({ message: fromPlayer, receivedAtMs: 0 });
  guest.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  guest.setPlayers([]);
  const alone = guest.frame({ nowMs: 400, dtSeconds: DT_SECONDS });
  assert.equal(alone.isHost, true);
  assert.ok(alone.outgoing.cats?.toys.some((toy) => toy.id === "yarn-2"));
});

test("a host that rejoins its room alone carries on the world it was running", () => {
  const engine = buildHost();
  engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
  engine.placeToy({ itemId: "yarn-2", x: 600, y: 500, nowMs: 10 });
  const hosting = engine.frame({ nowMs: 1000, dtSeconds: DT_SECONDS });
  assert.equal(hosting.isHost, true);
  assert.ok(hosting.toys.some((toy) => toy.id === "yarn-2"));
  engine.setPlayers([]);
  engine.setSelf({
    userId: undefined,
    connectionId: undefined,
    role: "watcher",
    roomId: undefined,
  });
  const between = engine.frame({ nowMs: 1016, dtSeconds: DT_SECONDS });
  assert.ok(between.toys.some((toy) => toy.id === "yarn-2"));
  engine.setSelf({
    userId: "me",
    connectionId: "me-tab-2",
    role: "player",
    roomId: "room-1",
  });
  engine.setPlayers([
    { ...buildPlayer({ userId: "me", joinedAt: 2 }), connectionId: "me-tab-2" },
  ]);
  const rooms = Array.from({ length: 80 }, (_, frame) =>
    engine.frame({ nowMs: 1032 + frame * 16, dtSeconds: DT_SECONDS })
  );
  assert.ok(
    rooms.every((room) => room.toys.some((toy) => toy.id === "yarn-2"))
  );
  assert.equal(rooms.at(-1)?.isHost, true);
  assert.ok(
    rooms.at(-1)?.outgoing.cats === undefined ||
      rooms.at(-1)?.outgoing.cats?.toys.some((toy) => toy.id === "yarn-2")
  );
});
