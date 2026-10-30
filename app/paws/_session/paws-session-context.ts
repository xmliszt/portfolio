"use client";

import { createContext } from "react";

import type { PawsSession, PawsSessionActions } from "@/lib/paws/session-types";
import type { createPawsBrowserClient } from "@/lib/paws/supabase/create-paws-browser-client";

export type PawsSessionValue = {
  session: PawsSession;
  actions: PawsSessionActions;
  client: ReturnType<typeof createPawsBrowserClient> | undefined;
};

/** The paws session, its sign-in actions and the browser Supabase client, from `PawsSessionProvider`. */
export const PawsSessionContext = createContext<PawsSessionValue | undefined>(
  undefined
);
