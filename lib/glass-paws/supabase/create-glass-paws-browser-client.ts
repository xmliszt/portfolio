import { createClient } from "@supabase/supabase-js";

/** Create the browser Supabase client for the glass page, keeping its sign-in session in local storage under its own key. */
export function createGlassPawsBrowserClient(options: { url: string; anonKey: string }) {
  return createClient(options.url, options.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "glass-paws-auth" },
    db: { schema: "glass_paws" },
  });
}
