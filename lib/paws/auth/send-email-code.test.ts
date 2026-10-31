import assert from "node:assert/strict";
import { test } from "node:test";

import type { PawsAuth, PawsAuthError } from "./paws-auth";
import { sendEmailCode } from "./send-email-code";

function buildFakeAuth(options: {
  updateUserError?: PawsAuthError;
  signInWithOtpError?: PawsAuthError;
}) {
  const calls: { updateUser: unknown[]; signInWithOtp: unknown[] } = {
    updateUser: [],
    signInWithOtp: [],
  };
  const auth: PawsAuth = {
    signInAnonymously: async () => ({ error: null }),
    updateUser: async (attributes) => {
      calls.updateUser = [...calls.updateUser, attributes];
      return { error: options.updateUserError ?? null };
    },
    signInWithOtp: async (credentials) => {
      calls.signInWithOtp = [...calls.signInWithOtp, credentials];
      return { error: options.signInWithOtpError ?? null };
    },
    verifyOtp: async () => ({ error: null }),
  };
  return { auth, calls };
}

const takeCaptchaToken = async () => "captcha";

test("adds the email to a guest's own account", async () => {
  const { auth, calls } = buildFakeAuth({});
  assert.deepEqual(
    await sendEmailCode({
      auth,
      email: "a@b.c",
      isGuest: true,
      takeCaptchaToken,
    }),
    {
      kind: "sent",
      codeType: "email_change",
    }
  );
  assert.deepEqual(calls.updateUser, [{ email: "a@b.c" }]);
  assert.equal(calls.signInWithOtp.length, 0);
});

test("signs a guest in to the account that already has the email", async () => {
  const { auth, calls } = buildFakeAuth({
    updateUserError: { code: "email_exists", status: 422 },
  });
  assert.deepEqual(
    await sendEmailCode({
      auth,
      email: "a@b.c",
      isGuest: true,
      takeCaptchaToken,
    }),
    {
      kind: "sent",
      codeType: "email",
    }
  );
  assert.deepEqual(calls.signInWithOtp, [
    {
      email: "a@b.c",
      options: { shouldCreateUser: true, captchaToken: "captcha" },
    },
  ]);
});

test("signs a visitor without a guest account in directly, without a captcha when there is none", async () => {
  const { auth, calls } = buildFakeAuth({});
  assert.deepEqual(
    await sendEmailCode({
      auth,
      email: "a@b.c",
      isGuest: false,
      takeCaptchaToken: async () => undefined,
    }),
    { kind: "sent", codeType: "email" }
  );
  assert.equal(calls.updateUser.length, 0);
  assert.deepEqual(calls.signInWithOtp, [
    { email: "a@b.c", options: { shouldCreateUser: true } },
  ]);
});

test("reports a rate-limited send as too soon", async () => {
  const linkLimited = buildFakeAuth({
    updateUserError: { code: "over_email_send_rate_limit", status: 429 },
  });
  assert.deepEqual(
    await sendEmailCode({
      auth: linkLimited.auth,
      email: "a@b.c",
      isGuest: true,
      takeCaptchaToken,
    }),
    {
      kind: "tooSoon",
    }
  );
  assert.equal(linkLimited.calls.signInWithOtp.length, 0);
  const signInLimited = buildFakeAuth({
    signInWithOtpError: { code: "over_email_send_rate_limit", status: 429 },
  });
  assert.deepEqual(
    await sendEmailCode({
      auth: signInLimited.auth,
      email: "a@b.c",
      isGuest: false,
      takeCaptchaToken,
    }),
    { kind: "tooSoon" }
  );
});

test("fails on any other error without falling back", async () => {
  const { auth, calls } = buildFakeAuth({
    updateUserError: { code: "email_address_invalid", status: 400 },
  });
  assert.deepEqual(
    await sendEmailCode({
      auth,
      email: "nope",
      isGuest: true,
      takeCaptchaToken,
    }),
    { kind: "failed" }
  );
  assert.equal(calls.signInWithOtp.length, 0);
});
