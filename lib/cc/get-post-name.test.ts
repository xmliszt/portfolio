import assert from "node:assert/strict";
import { test } from "node:test";

import { getPostName } from "./get-post-name";

test("prefers the title", () => {
  assert.equal(getPostName({ title: "Launch", body: "Hello" }), "Launch");
});

test("falls back to the first non-blank line of the body", () => {
  assert.equal(
    getPostName({ title: null, body: "\n  \nHi there\nmore" }),
    "Hi there"
  );
});

test("cuts long names", () => {
  assert.equal(
    getPostName({ title: "a".repeat(70), body: "" }),
    `${"a".repeat(60)}…`
  );
});
