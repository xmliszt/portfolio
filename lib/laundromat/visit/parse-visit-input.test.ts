import assert from "node:assert/strict";
import { test } from "node:test";

import { parseVisitInput } from "./parse-visit-input";

const VISITOR_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("keeps a well-formed visit", () => {
  assert.deepEqual(
    parseVisitInput({
      legacyVisitorId: VISITOR_ID,
      locale: "EN-us",
      referrer: "https://news.ycombinator.com/",
      countryHeader: "SG",
    }),
    {
      locale: "en",
      legacyVisitorId: VISITOR_ID,
      country: "SG",
      referrerHost: "news.ycombinator.com",
    }
  );
});

test("rejects a malformed locale", () => {
  const base = {
    legacyVisitorId: VISITOR_ID,
    referrer: "",
    countryHeader: "SG",
  };
  assert.equal(parseVisitInput({ ...base, locale: 42 }), undefined);
  assert.equal(parseVisitInput({ ...base, locale: "xx" }), undefined);
});

test("drops a malformed legacy visitor id", () => {
  for (const legacyVisitorId of [undefined, 7, "x", VISITOR_ID.toUpperCase()]) {
    const visit = parseVisitInput({
      legacyVisitorId,
      locale: "en",
      referrer: "",
      countryHeader: "SG",
    });
    assert.equal(visit?.locale, "en");
    assert.equal(visit?.legacyVisitorId, undefined);
  }
});

test("drops a malformed country or referrer", () => {
  for (const countryHeader of [null, "", "sg", "zz1"]) {
    assert.equal(
      parseVisitInput({
        legacyVisitorId: VISITOR_ID,
        locale: "en",
        referrer: 7,
        countryHeader,
      })?.country,
      undefined
    );
  }
  assert.equal(
    parseVisitInput({
      legacyVisitorId: VISITOR_ID,
      locale: "en",
      referrer: 7,
      countryHeader: "XX",
    })?.referrerHost,
    undefined
  );
});
