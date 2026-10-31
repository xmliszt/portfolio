import assert from "node:assert/strict";
import { test } from "node:test";

import type { Step } from "@/lib/paws/cat-look";

import { getCatPlaybackRate } from "./get-cat-playback-rate";

test("small cats play higher than large ones", () => {
  const small = getCatPlaybackRate({
    sound: "meow",
    size: "small",
    age: "adult",
    userId: "a",
  });
  const large = getCatPlaybackRate({
    sound: "meow",
    size: "large",
    age: "adult",
    userId: "a",
  });
  assert.ok(small > large);
});

test("age changes the shared purr but not the meow", () => {
  const options: { size: Step; userId: string } = {
    size: "medium",
    userId: "a",
  };
  assert.equal(
    getCatPlaybackRate({ ...options, sound: "meow", age: "kitten" }),
    getCatPlaybackRate({ ...options, sound: "meow", age: "old" })
  );
  assert.ok(
    getCatPlaybackRate({ ...options, sound: "purr", age: "kitten" }) >
      getCatPlaybackRate({ ...options, sound: "purr", age: "old" })
  );
});

test("adds a small fixed offset per user and stays in range", () => {
  const rates = ["a", "b", "c", "d", "e"].map((userId) =>
    getCatPlaybackRate({ sound: "purr", size: "medium", age: "adult", userId })
  );
  rates.forEach((rate) =>
    assert.ok(rate >= 0.96 && rate <= 1.04, String(rate))
  );
  assert.ok(new Set(rates).size > 1);
  assert.equal(
    getCatPlaybackRate({
      sound: "purr",
      size: "small",
      age: "kitten",
      userId: "a",
    }) <= 1.6,
    true
  );
});
