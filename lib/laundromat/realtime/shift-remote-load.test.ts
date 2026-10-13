import assert from "node:assert/strict";
import { test } from "node:test";

import type { RemoteLoad } from "./room-presence";
import { shiftRemoteLoad } from "./shift-remote-load";

test("moves a running cycle's start onto the local clock", () => {
  assert.deepEqual(
    shiftRemoteLoad({
      load: {
        phase: "running",
        kind: "washer",
        startedAt: 1_000,
        durationMs: 60_000,
      },
      offsetMs: -30_000,
    }),
    { phase: "running", kind: "washer", startedAt: -29_000, durationMs: 60_000 }
  );
});

test("leaves loaded and done loads as they are", () => {
  const loaded = { phase: "loaded", kind: "dryer" } satisfies RemoteLoad;
  assert.equal(shiftRemoteLoad({ load: loaded, offsetMs: 5 }), loaded);
});
