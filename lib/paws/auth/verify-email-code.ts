import type { VerifyCodeResult } from "@/lib/paws/session-types";

import type { PawsAuth } from "./paws-auth";
import type { EmailCodeType } from "./send-email-code";

const CODE_PATTERN = /^\d{6}$/;
const WRONG_CODE_CODES = ["otp_expired", "otp_disabled", "validation_failed"];

/** Verify the 6-digit `code` sent to `email` as `codeType`, returning `wrongCode` for a code that is not six digits or that Supabase rejects as wrong or expired. */
export async function verifyEmailCode(options: {
  auth: PawsAuth;
  email: string;
  code: string;
  codeType: EmailCodeType;
}): Promise<VerifyCodeResult> {
  const code = options.code.trim();
  if (!CODE_PATTERN.test(code)) return { kind: "wrongCode" };
  const { error } = await options.auth.verifyOtp({
    email: options.email,
    token: code,
    type: options.codeType,
  });
  if (error === null) return { kind: "verified" };
  const isWrong =
    error.status === 403 ||
    WRONG_CODE_CODES.some((wrong) => wrong === error.code);
  return isWrong ? { kind: "wrongCode" } : { kind: "failed" };
}
