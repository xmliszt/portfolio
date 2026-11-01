import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";

import { parseSignedRequest } from "./parse-signed-request";

const sign = (options: { payload: object; secret: string }) => {
  const body = Buffer.from(JSON.stringify(options.payload)).toString(
    "base64url"
  );
  const signature = createHmac("sha256", options.secret)
    .update(body)
    .digest("base64url");
  return `${signature}.${body}`;
};

test("returns the payload of a correctly signed request", () => {
  assert.deepEqual(
    parseSignedRequest({
      signedRequest: sign({
        payload: { user_id: "42", algorithm: "HMAC-SHA256" },
        secret: "s",
      }),
      appSecret: "s",
    }),
    { user_id: "42", algorithm: "HMAC-SHA256" }
  );
});

test("rejects a request signed with another secret or malformed", () => {
  assert.equal(
    parseSignedRequest({
      signedRequest: sign({ payload: { user_id: "42" }, secret: "other" }),
      appSecret: "s",
    }),
    undefined
  );
  assert.equal(
    parseSignedRequest({ signedRequest: "nope", appSecret: "s" }),
    undefined
  );
});
