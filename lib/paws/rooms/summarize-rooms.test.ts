import assert from "node:assert/strict";
import { test } from "node:test";

import { summarizeRooms } from "./summarize-rooms";

test("counts fresh players and watchers per room, busiest first", () => {
  const now = 100_000;
  assert.deepEqual(
    summarizeRooms({
      now,
      freshMs: 90_000,
      members: [
        { roomId: "a", userId: "1", role: "watcher", lastSeenAt: now },
        { roomId: "b", userId: "2", role: "player", lastSeenAt: now },
        { roomId: "b", userId: "3", role: "watcher", lastSeenAt: now },
        { roomId: "c", userId: "4", role: "player", lastSeenAt: 1 },
      ],
    }),
    [
      { roomId: "b", players: 1, watchers: 1 },
      { roomId: "a", players: 0, watchers: 1 },
    ]
  );
});
