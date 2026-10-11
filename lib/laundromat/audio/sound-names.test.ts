import assert from "node:assert/strict";
import { test } from "node:test";

import { LOOP_NAMES, SOUND_NAMES } from "./sound-names";

const KEBAB_CASE = /^[a-z]+(-[a-z]+)*$/;

test("sound and loop names are kebab-case", () => {
  [...SOUND_NAMES, ...LOOP_NAMES].forEach((name) =>
    assert.match(name, KEBAB_CASE, `${name} is not kebab-case`)
  );
});

test("sound and loop names are unique across both lists", () => {
  const names = [...SOUND_NAMES, ...LOOP_NAMES];
  assert.equal(new Set(names).size, names.length);
});
