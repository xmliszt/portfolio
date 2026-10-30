import assert from "node:assert/strict";
import { test } from "node:test";

import { getBabbleSyllables } from "./get-babble-syllables";

test("speaks each letter by its name's vowel, with spaces as short pauses", () => {
  assert.deepEqual(
    getBabbleSyllables("hi yo").map((syllable) =>
      syllable.kind === "voiced" ? syllable.vowel : "_"
    ),
    ["e", "a", "_", "a", "o"]
  );
});

test("rises before a question mark and gets louder for ! and capitals", () => {
  const question = getBabbleSyllables("are you ok?").flatMap((syllable) =>
    syllable.kind === "voiced" ? [syllable.semitones] : []
  );
  assert.deepEqual(question.slice(-3), [2, 4, 6]);
  assert.ok(
    getBabbleSyllables("yay!").every(
      (syllable) => syllable.kind !== "voiced" || syllable.loud
    )
  );
  const shout = getBabbleSyllables("Hi");
  assert.deepEqual(
    shout.map((syllable) => syllable.kind === "voiced" && syllable.loud),
    [true, false]
  );
});

test("babbles any script, the same way each time", () => {
  const japanese = getBabbleSyllables("こんにちは");
  assert.equal(japanese.length, 5);
  assert.deepEqual(japanese, getBabbleSyllables("こんにちは"));
  assert.equal(getBabbleSyllables("привет").length, 6);
});

test("drops symbols, merges pauses and stops at the syllable cap", () => {
  assert.deepEqual(getBabbleSyllables("@@  "), [
    { kind: "pause", long: false },
  ]);
  assert.equal(getBabbleSyllables("a".repeat(200)).length, 48);
});

test("merged pauses keep the longer one", () => {
  assert.deepEqual(getBabbleSyllables("hi .").at(-1), {
    kind: "pause",
    long: true,
  });
});
