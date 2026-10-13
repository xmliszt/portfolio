import assert from "node:assert/strict";
import { test } from "node:test";

import { maskProfanity } from "./mask-profanity";

test("masks English swear words and their spelled-out variants", () => {
  assert.equal(maskProfanity("porn is bad"), "**** is bad");
  assert.equal(maskProfanity("what the fuck"), "what the ****");
  assert.equal(maskProfanity("FuCk this"), "**** this");
  assert.equal(maskProfanity("fuuuck off"), "****** off");
  assert.equal(maskProfanity("sh1t"), "****");
});

test("keeps the text's length so line and selection offsets still hold", () => {
  const text = "oh fuuuck, 씨발 놈";
  assert.equal(maskProfanity(text).length, text.length);
});

test("leaves ordinary words that contain a swear word alone", () => {
  for (const text of [
    "analysis of the class",
    "Scunthorpe",
    "assistant",
    "cockroach",
    "computer",
    "Randi waved",
    "the fall of Troia",
    "시발역에서 만나",
    "牛乳を飲む",
  ]) {
    assert.equal(maskProfanity(text), text);
  }
});

test("masks whole words in other languages and any match in scripts without spaces", () => {
  assert.equal(maskProfanity("Was für eine Scheiße!"), "Was für eine *******!");
  assert.equal(maskProfanity("kurwa mać"), "***** mać");
  assert.equal(maskProfanity("ты сука"), "ты ****");
  assert.equal(maskProfanity("씨발놈아"), "**놈아");
  assert.equal(maskProfanity("你个傻逼"), "你个**");
});

test("leaves everyday words in the site's other languages alone", () => {
  for (const text of [
    "feliz cumpleaños",
    "un café negro",
    "das ist dick",
    "ein dicker Pullover",
    "mein Abo",
    "Penisola sorrentina",
    "Pute mit Reis",
    "polla en pepitoria",
    "병신년 (1956)",
    "cumin and shiitake",
    "same-sex marriage",
    "tit for tat",
    "Merdeka!",
    "сукно",
  ]) {
    assert.equal(maskProfanity(text), text);
  }
});

test("masks inflected forms, capital Turkish İ and decomposed accents", () => {
  for (const text of [
    "хуйня",
    "нахуй",
    "заебал",
    "суки",
    "pierdolony",
    "zajebisty",
    "kurwą",
    "putos",
    "pendejos",
    "cabrones",
    "jodido",
    "connards",
    "Scheißegal",
    "SİKERİM",
    "SİKTİR",
    "cabrón",
    "dickhead",
  ]) {
    assert.equal(maskProfanity(text), "*".repeat(text.length), text);
  }
  assert.equal(maskProfanity("foda-se"), "*******");
});
