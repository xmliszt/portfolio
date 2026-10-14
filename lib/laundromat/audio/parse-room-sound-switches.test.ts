import assert from "node:assert/strict";
import { test } from "node:test";

import { parseRoomSoundSwitches } from "./parse-room-sound-switches";
import { ROOM_SOUND_GROUPS } from "./room-sound-groups";

test("turns every room sound on when nothing is stored", () => {
  const switches = parseRoomSoundSwitches(null);
  ROOM_SOUND_GROUPS.forEach((group) =>
    assert.equal(switches[group], true, `${group} should be on`)
  );
});

test("turns off only the stored groups", () => {
  const switches = parseRoomSoundSwitches(JSON.stringify(["tv", "shop-bell"]));
  assert.equal(switches.tv, false);
  assert.equal(switches["shop-bell"], false);
  assert.equal(switches.machines, true);
  assert.equal(switches.lamp, true);
});

test("ignores unknown groups and unreadable values", () => {
  assert.equal(
    parseRoomSoundSwitches(JSON.stringify(["radio"])).machines,
    true
  );
  assert.equal(parseRoomSoundSwitches("{not json").coffee, true);
  assert.equal(parseRoomSoundSwitches(JSON.stringify({ tv: false })).tv, true);
});
