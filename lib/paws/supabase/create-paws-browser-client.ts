import { createClient } from "@supabase/supabase-js";

/** Create the browser Supabase client for the paws page, keeping its sign-in session in local storage under its own key. */
export function createPawsBrowserClient(options: {
  url: string;
  anonKey: string;
}) {
  return createClient(options.url, options.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "paws-auth",
    },
    db: { schema: "paws" },
  });
}
