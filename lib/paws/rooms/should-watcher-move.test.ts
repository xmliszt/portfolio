import assert from "node:assert/strict";
import { test } from "node:test";

import type { RoomMember } from "./pick-room";
import { shouldWatcherMove } from "./should-watcher-move";

const NOW = 100_000;
const member = (options: {
  roomId: string;
  userId: string;
  role: RoomMember["role"];
  lastSeenAt?: number;
}): RoomMember => ({ lastSeenAt: NOW, ...options });
const ask = (members: RoomMember[], maxWatchers = 4) =>
  shouldWatcherMove({
    members,
    userId: "guest",
    roomId: "empty",
    now: NOW,
    freshMs: 90_000,
    maxWatchers,
  });

test("a guest alone moves to a room where someone is playing", () => {
  assert.equal(
    ask([
      member({ roomId: "empty", userId: "guest", role: "watcher" }),
      member({ roomId: "busy", userId: "cat", role: "player" }),
    ]),
    true
  );
});

test("stays when its room has a player, no room has one, or the busy room is full of guests", () => {
  assert.equal(
    ask([
      member({ roomId: "empty", userId: "guest", role: "watcher" }),
      member({ roomId: "empty", userId: "cat", role: "player" }),
      member({ roomId: "busy", userId: "other", role: "player" }),
    ]),
    false
  );
  assert.equal(
    ask([
      member({ roomId: "empty", userId: "guest", role: "watcher" }),
      member({ roomId: "quiet", userId: "g2", role: "watcher" }),
    ]),
    false
  );
  assert.equal(
    ask(
      [
        member({ roomId: "busy", userId: "cat", role: "player" }),
        member({ roomId: "busy", userId: "g2", role: "watcher" }),
      ],
      1
    ),
    false
  );
});

test("ignores players who stopped sending heartbeats", () => {
  assert.equal(
    ask([
      member({ roomId: "busy", userId: "cat", role: "player", lastSeenAt: 1 }),
    ]),
    false
  );
});
