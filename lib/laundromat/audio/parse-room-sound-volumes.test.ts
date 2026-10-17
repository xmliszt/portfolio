import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomSoundVolumes } from "./parse-room-sound-volumes";
import { ROOM_SOUND_GROUPS } from "./room-sound-groups";

test("gives every room sound its usual volume when nothing is stored", () => {
  const volumes = parseRoomSoundVolumes(null);
  ROOM_SOUND_GROUPS.forEach((group) =>
    assert.equal(volumes[group], 1, `${group} should be at 1`)
  );
});

test("keeps stored volumes and clamps them into range", () => {
  const volumes = parseRoomSoundVolumes(
    JSON.stringify({ weather: 1.4, machines: 0.456, tv: 9, lamp: -1 })
  );
  assert.equal(volumes.weather, 1.4);
  assert.equal(volumes.machines, 0.46);
  assert.equal(volumes.tv, 1.5);
  assert.equal(volumes.lamp, 0);
  assert.equal(volumes.coffee, 1);
});

test("ignores unknown groups and unreadable values", () => {
  assert.equal(parseRoomSoundVolumes(JSON.stringify({ radio: 0 })).tv, 1);
  assert.equal(parseRoomSoundVolumes("{not json").coffee, 1);
  assert.equal(parseRoomSoundVolumes(JSON.stringify([0.2])).machines, 1);
  assert.equal(
    parseRoomSoundVolumes(JSON.stringify({ weather: "loud" })).weather,
    1
  );
});
