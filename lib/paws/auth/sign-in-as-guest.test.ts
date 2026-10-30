import assert from "node:assert/strict";
import { test } from "node:test";

import type { PawsAuth } from "./paws-auth";
import { signInAsGuest } from "./sign-in-as-guest";

function buildFakeAuth(options: { fails: boolean }) {
  const calls: { signInAnonymously: unknown[] } = { signInAnonymously: [] };
  const auth: PawsAuth = {
    signInAnonymously: async (credentials) => {
      calls.signInAnonymously = [...calls.signInAnonymously, credentials];
      return {
        error: options.fails ? { code: "captcha_failed", status: 400 } : null,
      };
    },
    updateUser: async () => ({ error: null }),
    signInWithOtp: async () => ({ error: null }),
    verifyOtp: async () => ({ error: null }),
  };
  return { auth, calls };
}

test("signs in anonymously with the captcha token", async () => {
  const { auth, calls } = buildFakeAuth({ fails: false });
  assert.deepEqual(await signInAsGuest({ auth, captchaToken: "t" }), {
    kind: "signedIn",
  });
  assert.deepEqual(calls.signInAnonymously, [
    { options: { captchaToken: "t" } },
  ]);
});

test("signs in without a captcha token when there is none, and reports a failure", async () => {
  const { auth, calls } = buildFakeAuth({ fails: true });
  assert.deepEqual(await signInAsGuest({ auth, captchaToken: undefined }), {
    kind: "failed",
  });
  assert.deepEqual(calls.signInAnonymously, [{ options: {} }]);
});
