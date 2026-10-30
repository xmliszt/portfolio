import type { PawsAuth } from "./paws-auth";

/** Sign in as a new anonymous user with `captchaToken`, and return whether it worked. */
export async function signInAsGuest(options: {
  auth: PawsAuth;
  captchaToken: string | undefined;
}) {
  const { error } = await options.auth.signInAnonymously({
    options:
      options.captchaToken === undefined
        ? {}
        : { captchaToken: options.captchaToken },
  });
  return error === null
    ? { kind: "signedIn" as const }
    : { kind: "failed" as const };
}
