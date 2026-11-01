"use server";

import { redirect } from "next/navigation";

import { createCcAuthClient } from "@/lib/cc/supabase/create-cc-auth-client";

/** Sign out and go to the login page. */
export async function signOut() {
  const supabase = await createCcAuthClient();
  await supabase.auth.signOut();
  redirect("/login");
}
