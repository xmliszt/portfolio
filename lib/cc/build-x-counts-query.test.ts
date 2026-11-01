import assert from "node:assert/strict";
import { test } from "node:test";

import { buildXCountsQuery } from "./build-x-counts-query";

test("leaves a single word or hashtag unquoted", () => {
  assert.equal(buildXCountsQuery("laundromat"), "laundromat -is:retweet");
  assert.equal(
    buildXCountsQuery(" #buildinpublic "),
    "#buildinpublic -is:retweet"
  );
});

test("quotes a multi-word term and collapses its spaces", () => {
  assert.equal(
    buildXCountsQuery("cozy  web   game"),
    '"cozy web game" -is:retweet'
  );
});

test("drops quotes the term already had", () => {
  assert.equal(buildXCountsQuery('"indie dev"'), '"indie dev" -is:retweet');
});
