import assert from "node:assert/strict";
import { test } from "node:test";

import { readPawsSession } from "./read-paws-session";

test("reads no session as loading", () => {
  assert.deepEqual(readPawsSession(null), { kind: "signedOut" });
});

test("reads an anonymous user as a guest", () => {
  assert.deepEqual(
    readPawsSession({
      access_token: "t",
      user: { id: "u", is_anonymous: true, email: "" },
    }),
    {
      kind: "guest",
      userId: "u",
      accessToken: "t",
    }
  );
});

test("reads a user with an email as a member", () => {
  assert.deepEqual(
    readPawsSession({
      access_token: "t",
      user: { id: "u", is_anonymous: false, email: "a@b.c" },
    }),
    {
      kind: "member",
      userId: "u",
      email: "a@b.c",
      accessToken: "t",
    }
  );
});
