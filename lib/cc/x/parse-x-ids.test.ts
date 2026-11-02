import assert from "node:assert/strict";
import { test } from "node:test";

import { parseXCommunityId } from "./parse-x-community-id";
import { parseXStatusId } from "./parse-x-status-id";
import { parseXUserIdFromToken } from "./parse-x-user-id-from-token";

test("reads the post id from X and Twitter post links", () => {
  assert.equal(
    parseXStatusId("https://x.com/i/web/status/2117218500766740986"),
    "2117218500766740986"
  );
  assert.equal(
    parseXStatusId("https://twitter.com/xmliszt/status/123?s=20"),
    "123"
  );
  assert.equal(parseXStatusId("https://x.com/xmliszt"), undefined);
});

test("reads a community id from a raw id or a community link", () => {
  assert.equal(
    parseXCommunityId(" 1700000000000000000 "),
    "1700000000000000000"
  );
  assert.equal(
    parseXCommunityId("https://x.com/i/communities/1493446837214187523"),
    "1493446837214187523"
  );
  assert.equal(parseXCommunityId("Digital Art"), undefined);
});

test("reads the user id prefix of an OAuth 1.0a access token", () => {
  assert.equal(parseXUserIdFromToken("123456-AbCdEf"), "123456");
  assert.equal(parseXUserIdFromToken("AbCdEf"), undefined);
});
