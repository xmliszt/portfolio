import assert from "node:assert/strict";
import { test } from "node:test";

import { isBlocklistedMeowText } from "./is-blocklisted-meow-text";

test("allows ordinary and silly sounds", () => {
  ["meow", "tiny fart", "sneeze then purr", "mrrp?", "a little burp"].forEach(
    (text) => assert.equal(isBlocklistedMeowText(text), false, text)
  );
});

test("blocks listed words on word boundaries", () => {
  assert.equal(isBlocklistedMeowText("loud scream"), true);
  assert.equal(isBlocklistedMeowText("cat says hello"), true);
  assert.equal(isBlocklistedMeowText("gun-shot"), true);
  assert.equal(isBlocklistedMeowText("shotgun"), false);
});

test("sees through digit lookalikes", () => {
  assert.equal(isBlocklistedMeowText("scr3am"), true);
  assert.equal(isBlocklistedMeowText("p0rn"), true);
});
