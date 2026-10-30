import type { PawsAuth, PawsAuthError } from "./paws-auth";

export type EmailCodeType = "email_change" | "email";

export type SentEmailCode =
  | { kind: "sent"; codeType: EmailCodeType }
  | { kind: "tooSoon" }
  | { kind: "failed" };

const TOO_SOON_CODES = [
  "over_email_send_rate_limit",
  "over_request_rate_limit",
];
const TAKEN_EMAIL_CODES = ["email_exists", "user_already_exists"];

function isTooSoon(error: PawsAuthError) {
  return (
    error.status === 429 || TOO_SOON_CODES.some((code) => code === error.code)
  );
}

/** Send a 6-digit sign-in code to `email` and return which `verifyOtp` type it is for: a guest first tries to add the email to their own account (`email_change`), and falls back to signing in to the account that already has it (`email`), as does a visitor who is not a guest; a rate-limited send is `tooSoon`. */
export async function sendEmailCode(options: {
  auth: PawsAuth;
  email: string;
  isGuest: boolean;
  takeCaptchaToken: () => Promise<string | undefined>;
}): Promise<SentEmailCode> {
  if (options.isGuest) {
    const linked = await options.auth.updateUser({ email: options.email });
    if (linked.error === null)
      return { kind: "sent", codeType: "email_change" };
    if (isTooSoon(linked.error)) return { kind: "tooSoon" };
    if (!TAKEN_EMAIL_CODES.some((code) => code === linked.error?.code))
      return { kind: "failed" };
  }
  const captchaToken = await options.takeCaptchaToken();
  const signIn = await options.auth.signInWithOtp({
    email: options.email,
    options: {
      shouldCreateUser: true,
      ...(captchaToken === undefined ? {} : { captchaToken }),
    },
  });
  if (signIn.error === null) return { kind: "sent", codeType: "email" };
  return isTooSoon(signIn.error) ? { kind: "tooSoon" } : { kind: "failed" };
}
