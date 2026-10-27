import assert from "node:assert/strict";
import { test } from "node:test";

import { getReferrerHost } from "./get-referrer-host";

test("returns the lowercase host of an outside referrer", () => {
  assert.equal(
    getReferrerHost("https://News.YCombinator.com/item?id=1"),
    "news.ycombinator.com"
  );
});

test("drops laundro.cafe's own hosts", () => {
  assert.equal(getReferrerHost("https://laundro.cafe/ja"), undefined);
  assert.equal(getReferrerHost("https://www.laundro.cafe/"), undefined);
});

test("drops empty, malformed and non-http referrers", () => {
  assert.equal(getReferrerHost(""), undefined);
  assert.equal(getReferrerHost("not a url"), undefined);
  assert.equal(getReferrerHost("android-app://com.slack/"), undefined);
});

test("drops own hosts written with a trailing dot", () => {
  assert.equal(getReferrerHost("https://laundro.cafe./"), undefined);
});

test("strips the trailing dot from an outside host", () => {
  assert.equal(getReferrerHost("https://example.com./a"), "example.com");
});

test("drops hosts longer than 253 characters", () => {
  const label = "a".repeat(60);
  const host = [label, label, label, label, label, "com"].join(".");
  assert.equal(getReferrerHost(`https://${host}/`), undefined);
});
