import assert from "node:assert/strict";
import { test } from "node:test";

import { describeMachine } from "@/lib/laundromat/laundry/describe-machine";
import { describeMachineControl } from "@/lib/laundromat/laundry/describe-machine-control";
import { describeShelfBook } from "@/lib/laundromat/notebook/describe-shelf-book";
import { describeSpread } from "@/lib/laundromat/notebook/describe-spread";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { describeTvControl } from "@/lib/laundromat/tv/describe-tv-control";

import { getLaundromatCopy } from "./get-laundromat-copy";
import { LAUNDROMAT_LOCALES } from "./laundromat-locales";

const washer = { id: "washer-1", kind: "washer", number: 1 } as const;
const endsAt = new Date(2026, 9, 8, 14, 5).getTime();

test("every locale names itself and keeps the brand", () => {
  for (const locale of LAUNDROMAT_LOCALES) {
    const copy = getLaundromatCopy(locale);
    assert.equal(copy.locale, locale);
    assert.equal(copy.site.name, "laundro.cafe", locale);
  }
});

test("every locale builds sentences without leaking placeholders", () => {
  for (const locale of LAUNDROMAT_LOCALES) {
    const copy = getLaundromatCopy(locale);
    const sentences = [
      ...Object.values(
        describeMachine({
          machine: washer,
          status: {
            kind: "running",
            endsAt,
            remainingMs: 600_000,
            remind: false,
          },
          copy,
        })
      ),
      ...Object.values(
        describeMachineControl({
          control: "start",
          machine: washer,
          status: { kind: "loaded" },
          minutes: 30,
          nextMinutes: 45,
          notifications: "default",
          copy,
        })
      ),
      ...Object.values(
        describeTvControl({
          control: "tuner",
          state: { on: true, station: 0, volumePercent: 60 },
          settings: sceneConfig.details.tv,
          copy,
        })
      ),
      ...Object.values(
        describeShelfBook({
          number: 3,
          startedAtMs: endsAt,
          filledAtMs: endsAt,
          entryCount: 22,
          copy,
        })
      ),
      describeSpread({ spread: 6, pageCount: 48, copy }),
      copy.shelf.bookCount({ count: 5 }),
      copy.firstVisit.basketPartial({ count: 2, total: 6 }),
    ];
    const keepsValue = (text: string, value: string) =>
      assert.ok(text.includes(value), `${locale}: "${text}" lost ${value}`);
    keepsValue(describeSpread({ spread: 6, pageCount: 48, copy }), "12");
    keepsValue(describeSpread({ spread: 6, pageCount: 48, copy }), "13");
    keepsValue(copy.shelf.bookCount({ count: 5 }), "5");
    keepsValue(copy.shelf.entryCount({ count: 22 }), "22");
    keepsValue(copy.firstVisit.basketPartial({ count: 2, total: 6 }), "6");
    keepsValue(copy.machine.name(washer), "1");
    keepsValue(copy.notebook.number({ number: 7 }), "7");
    keepsValue(copy.tv.volumeLabel({ percent: 60 }), "60");
    keepsValue(copy.notebook.missing({ number: 7 }), "7");
    for (const sentence of sentences) {
      if (typeof sentence !== "string") continue;
      assert.doesNotMatch(sentence, /undefined|NaN|\$\{|\[object/, locale);
    }
  }
});

test("keeps the machine readout short enough for its display", () => {
  for (const locale of LAUNDROMAT_LOCALES) {
    const { readoutDone } = getLaundromatCopy(locale);
    const isWide = /[\u1100-\u11ff\u3000-\u9fff\uac00-\ud7af]/.test(
      readoutDone
    );
    assert.ok(
      readoutDone.length <= (isWide ? 3 : 6),
      `${locale}: ${readoutDone}`
    );
  }
});
