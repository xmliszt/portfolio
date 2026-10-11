import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeShelf } from "./describe-shelf";

test("an empty shelf says so and cannot be looked at", () => {
  const empty = describeShelf({
    shelf: { kind: "online", bookCount: 0 },
    copy: en,
  });
  assert.equal(empty.ready, false);
  assert.equal(empty.tooltip, "no filled notebooks yet");
});

test("a shelf with books can be looked at and counts them", () => {
  assert.equal(
    describeShelf({ shelf: { kind: "online", bookCount: 1 }, copy: en }).ready,
    true
  );
  assert.equal(
    describeShelf({ shelf: { kind: "online", bookCount: 1 }, copy: en })
      .tooltip,
    "1 filled notebook"
  );
  assert.equal(
    describeShelf({ shelf: { kind: "online", bookCount: 3 }, copy: en })
      .tooltip,
    "3 filled notebooks"
  );
});

test("a shelf still loading or offline does not claim to be empty", () => {
  assert.equal(
    describeShelf({ shelf: { kind: "loading" }, copy: en }).ready,
    false
  );
  assert.notEqual(
    describeShelf({ shelf: { kind: "loading" }, copy: en }).tooltip,
    "no filled notebooks yet"
  );
  assert.equal(
    describeShelf({ shelf: { kind: "offline" }, copy: en }).tooltip,
    "the shelf is offline at the moment"
  );
});
