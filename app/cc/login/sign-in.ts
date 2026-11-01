"use server";

import { redirect } from "next/navigation";

import { isCcOwnerEmail } from "@/lib/cc/auth/is-cc-owner-email";
import { requestPasswordSession } from "@/lib/cc/auth/request-password-session";
import { createCcAuthClient } from "@/lib/cc/supabase/create-cc-auth-client";

export type SignInState = { kind: "idle" } | { kind: "error"; message: string };

/** Sign the owner in with email and password and go to the overview; return an error state for any other email or a wrong password. */
export async function signIn(
  _previous: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!isCcOwnerEmail(email)) {
    return { kind: "error", message: "That email or password is wrong." };
  }
  const session = await requestPasswordSession({ email, password });
  if (session === undefined) {
    return { kind: "error", message: "That email or password is wrong." };
  }
  const supabase = await createCcAuthClient();
  const { error } = await supabase.auth.setSession(session);
  if (error) return { kind: "error", message: "Sign-in failed. Try again." };
  redirect("/");
}
