import assert from "node:assert/strict";
import { test } from "node:test";

import { getRoomSoundTrace } from "./get-room-sound-trace";
import { ROOM_SOUND_GROUPS } from "./room-sound-groups";

test("keeps every trace between -1 and 1", () => {
  ROOM_SOUND_GROUPS.forEach((group) => {
    for (let step = 0; step <= 200; step += 1) {
      const height = getRoomSoundTrace({
        group,
        x: step / 200,
        timeS: step * 0.37,
      });
      assert.ok(
        height >= -1 && height <= 1,
        `${group} trace reached ${height}`
      );
    }
  });
});
