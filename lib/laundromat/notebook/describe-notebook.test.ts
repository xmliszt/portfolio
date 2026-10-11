import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeEntryMeta } from "./describe-entry-meta";
import { describeLeaveFailure } from "./describe-leave-failure";
import { describeShelfBook } from "./describe-shelf-book";
import { detectScript } from "./detect-script";
import { formatEntryDate } from "./format-entry-date";
import { isRtlScript } from "./is-rtl-script";

test("detects the script a note is written in", () => {
  assert.equal(detectScript("The coffee here is bad and I love it."), "latin");
  assert.equal(detectScript("Если ты читаешь это"), "latin");
  assert.equal(detectScript("오늘도 수고했어요."), "korean");
  assert.equal(
    detectScript("雨の夜の洗濯は、なぜか少し落ち着く。"),
    "japanese"
  );
  assert.equal(detectScript("洗衣机转啊转。"), "chinese");
  assert.equal(detectScript("كل شيء سيكون على ما يرام"), "arabic");
  assert.equal(detectScript("שלום"), "hebrew");
  assert.equal(detectScript("धीरे चलो"), "devanagari");
  assert.equal(detectScript("ভালো থেকো"), "bengali");
  assert.equal(detectScript("ok 🙂"), "latin");
});

test("writes Arabic and Hebrew right to left", () => {
  assert.equal(isRtlScript("arabic"), true);
  assert.equal(isRtlScript("hebrew"), true);
  assert.equal(isRtlScript("korean"), false);
});

test("formats the entry date and sign-off", () => {
  const at = new Date(2026, 9, 8, 2, 14).getTime();
  assert.equal(
    formatEntryDate({ timestampMs: at, locale: "en" }),
    "oct 8 · 2:14 a.m."
  );
  assert.equal(
    describeEntryMeta({ signOff: null, createdAtMs: at, locale: "en" }),
    "oct 8 · 2:14 a.m."
  );
  assert.equal(
    describeEntryMeta({
      signOff: "a night owl",
      createdAtMs: at,
      locale: "en",
    }),
    "— a night owl · oct 8 · 2:14 a.m."
  );
});

test("describes a filled book on the shelf", () => {
  const book = describeShelfBook({
    number: 3,
    startedAtMs: new Date(2026, 2, 30).getTime(),
    filledAtMs: new Date(2026, 4, 11).getTime(),
    entryCount: 301,
    copy: en,
  });
  assert.equal(book.tooltip, "mar 30 – may 11 · 301 entries");
  assert.equal(book.label, "Open notebook No. 3, mar 30 – may 11, 301 entries");
  assert.match(
    describeShelfBook({
      number: 1,
      startedAtMs: 0,
      filledAtMs: 0,
      entryCount: 1,
      copy: en,
    }).tooltip,
    /· 1 entry$/
  );
});

test("explains why a note could not be left", () => {
  assert.equal(
    describeLeaveFailure({
      failure: { kind: "rejected", reason: "rate_limited" },
      copy: en,
    }),
    "one note every two minutes · try again soon"
  );
  assert.equal(
    describeLeaveFailure({ failure: { kind: "offline" }, copy: en }),
    "notebook is offline at the moment · your note stays here"
  );
  assert.equal(
    describeLeaveFailure({
      failure: { kind: "rejected", reason: "invalid_line_count" },
      copy: en,
    }),
    "too long for the notebook · shorten it a little"
  );
});
