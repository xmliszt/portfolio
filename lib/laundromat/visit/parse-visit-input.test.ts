import assert from "node:assert/strict";
import { test } from "node:test";

import { parseVisitInput } from "./parse-visit-input";

const VISITOR_ID = "0f8fad5b-d9cb-469f-a165-70867728950e";

test("keeps a well-formed visit", () => {
  assert.deepEqual(
    parseVisitInput({
      visitorId: VISITOR_ID,
      locale: "EN-us",
      referrer: "https://news.ycombinator.com/",
      countryHeader: "SG",
    }),
    {
      visitorId: VISITOR_ID,
      locale: "en",
      country: "SG",
      referrerHost: "news.ycombinator.com",
    }
  );
});

test("rejects a malformed visitor id or locale", () => {
  const base = { referrer: "", countryHeader: "SG" };
  assert.equal(
    parseVisitInput({
      ...base,
      visitorId: VISITOR_ID.toUpperCase(),
      locale: "en",
    }),
    undefined
  );
  assert.equal(
    parseVisitInput({ ...base, visitorId: "x", locale: "en" }),
    undefined
  );
  assert.equal(
    parseVisitInput({ ...base, visitorId: VISITOR_ID, locale: 42 }),
    undefined
  );
  assert.equal(
    parseVisitInput({ ...base, visitorId: VISITOR_ID, locale: "xx" }),
    undefined
  );
});

test("drops a malformed country or referrer", () => {
  for (const countryHeader of [null, "", "sg", "zz1"]) {
    assert.equal(
      parseVisitInput({
        visitorId: VISITOR_ID,
        locale: "en",
        referrer: 7,
        countryHeader,
      })?.country,
      undefined
    );
  }
  assert.equal(
    parseVisitInput({
      visitorId: VISITOR_ID,
      locale: "en",
      referrer: 7,
      countryHeader: "XX",
    })?.referrerHost,
    undefined
  );
});
