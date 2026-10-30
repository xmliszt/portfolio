import assert from "node:assert/strict";
import { test } from "node:test";

import type { PawsAuth, PawsAuthError } from "./paws-auth";
import { verifyEmailCode } from "./verify-email-code";

function buildFakeAuth(options: { error?: PawsAuthError }) {
  const calls: { verifyOtp: unknown[] } = { verifyOtp: [] };
  const auth: PawsAuth = {
    signInAnonymously: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
    signInWithOtp: async () => ({ error: null }),
    verifyOtp: async (params) => {
      calls.verifyOtp = [...calls.verifyOtp, params];
      return { error: options.error ?? null };
    },
  };
  return { auth, calls };
}

test("verifies a code with the type it was sent for", async () => {
  const { auth, calls } = buildFakeAuth({});
  assert.deepEqual(
    await verifyEmailCode({
      auth,
      email: "a@b.c",
      code: " 123456 ",
      codeType: "email_change",
    }),
    {
      kind: "verified",
    }
  );
  assert.deepEqual(calls.verifyOtp, [
    { email: "a@b.c", token: "123456", type: "email_change" },
  ]);
});

test("calls a code that is not six digits wrong without asking Supabase", async () => {
  const { auth, calls } = buildFakeAuth({});
  assert.deepEqual(
    await verifyEmailCode({
      auth,
      email: "a@b.c",
      code: "12a456",
      codeType: "email",
    }),
    {
      kind: "wrongCode",
    }
  );
  assert.equal(calls.verifyOtp.length, 0);
});

test("calls a rejected or expired code wrong and anything else a failure", async () => {
  const expired = buildFakeAuth({
    error: { code: "otp_expired", status: 403 },
  });
  assert.deepEqual(
    await verifyEmailCode({
      auth: expired.auth,
      email: "a@b.c",
      code: "123456",
      codeType: "email",
    }),
    {
      kind: "wrongCode",
    }
  );
  const down = buildFakeAuth({ error: { status: 500 } });
  assert.deepEqual(
    await verifyEmailCode({
      auth: down.auth,
      email: "a@b.c",
      code: "123456",
      codeType: "email",
    }),
    {
      kind: "failed",
    }
  );
});
