import assert from "node:assert/strict";
import { test } from "node:test";

import { getLocaleScript } from "./get-locale-script";

test("draws CJK, Korean and Hindi translations in their own handwriting", () => {
  assert.equal(getLocaleScript("ja"), "japanese");
  assert.equal(getLocaleScript("zh-Hant"), "chinese");
  assert.equal(getLocaleScript("ko"), "korean");
  assert.equal(getLocaleScript("hi"), "devanagari");
  assert.equal(getLocaleScript("de"), "latin");
});
