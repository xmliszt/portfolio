import assert from "node:assert/strict";
import { test } from "node:test";

import { parseListRoomsResponse } from "./parse-list-rooms-response";

test("reads the rooms and drops malformed ones", () => {
  assert.deepEqual(
    parseListRoomsResponse({
      kind: "rooms",
      rooms: [
        { roomId: "a", players: 2, watchers: 1 },
        { roomId: "B C", players: 1, watchers: 0 },
        { roomId: "d", players: -1, watchers: 0 },
      ],
    }),
    [{ roomId: "a", players: 2, watchers: 1 }]
  );
  assert.equal(parseListRoomsResponse({ kind: "failed" }), undefined);
});
