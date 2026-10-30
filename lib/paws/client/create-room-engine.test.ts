import assert from "node:assert/strict";
import { test } from "node:test";

import { ROOM_LIMITS } from "@/lib/paws/room-limits";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
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

test("shows the host's paw prints once the render delay has passed", () => {
  const engine = buildFollower();
  engine.receiveCats({
    message: {
      hostId: "host-tab",
      sentAt: 0,
      cats: [],
      prints: [
        { kind: "pawPrint", userId: "host", x: 100, y: 100, angle: 0, leg: 0 },
      ],
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
  const room = engine.frame({ nowMs: 0, dtSeconds: DT_SECONDS });
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
