import assert from "node:assert/strict";
import { test } from "node:test";

import { pickRoom, type RoomMember } from "./pick-room";

const NOW = 1_000_000;
const LIMITS = { maxPlayers: 2, maxWatchers: 1 };

function buildMember(options: {
  roomId: string;
  userId: string;
  role: RoomMember["role"];
  ageMs?: number;
}): RoomMember {
  return {
    roomId: options.roomId,
    userId: options.userId,
    role: options.role,
    lastSeenAt: NOW - (options.ageMs ?? 0),
  };
}

function pick(options: {
  members: RoomMember[];
  userId?: string;
  role: RoomMember["role"];
}) {
  return pickRoom({
    members: options.members,
    userId: options.userId ?? "me",
    role: options.role,
    now: NOW,
    freshMs: 90_000,
    limits: LIMITS,
    createRoomId: () => "new-room",
  });
}

test("opens a new room when there are no rooms", () => {
  assert.deepEqual(pick({ members: [], role: "player" }), {
    kind: "new",
    roomId: "new-room",
  });
  assert.deepEqual(pick({ members: [], role: "watcher" }), {
    kind: "new",
    roomId: "new-room",
  });
});

test("fills the room with the most players first", () => {
  const members = [
    buildMember({ roomId: "a", userId: "p1", role: "player" }),
    buildMember({ roomId: "b", userId: "p2", role: "player" }),
    buildMember({ roomId: "b", userId: "w1", role: "watcher" }),
  ];
  assert.deepEqual(pick({ members, role: "player" }), {
    kind: "existing",
    roomId: "a",
  });
  assert.deepEqual(
    pick({
      members: [
        ...members,
        buildMember({ roomId: "b", userId: "p3", role: "watcher" }),
      ],
      role: "player",
    }),
    {
      kind: "existing",
      roomId: "a",
    }
  );
});

test("opens a new room for a player when every room's player slots are full", () => {
  const members = [
    buildMember({ roomId: "a", userId: "p1", role: "player" }),
    buildMember({ roomId: "a", userId: "p2", role: "player" }),
  ];
  assert.deepEqual(pick({ members, role: "player" }), {
    kind: "new",
    roomId: "new-room",
  });
});

test("tells a watcher every room is full when every watcher slot is taken", () => {
  const members = [
    buildMember({ roomId: "a", userId: "p1", role: "player" }),
    buildMember({ roomId: "a", userId: "w1", role: "watcher" }),
  ];
  assert.deepEqual(pick({ members, role: "watcher" }), { kind: "full" });
});

test("keeps a member in their own room when it still has a slot for the role", () => {
  const members = [
    buildMember({ roomId: "a", userId: "p1", role: "player" }),
    buildMember({ roomId: "b", userId: "me", role: "watcher" }),
  ];
  assert.deepEqual(pick({ members, role: "player" }), {
    kind: "existing",
    roomId: "b",
  });
});

test("does not count members who stopped sending heartbeats", () => {
  const members = [
    buildMember({ roomId: "a", userId: "p1", role: "player", ageMs: 120_000 }),
    buildMember({ roomId: "a", userId: "p2", role: "player", ageMs: 120_000 }),
    buildMember({ roomId: "a", userId: "w1", role: "watcher", ageMs: 120_000 }),
  ];
  assert.deepEqual(pick({ members, role: "watcher" }), {
    kind: "new",
    roomId: "new-room",
  });
});
