"use client";

import { useContext } from "react";

import { PawsSessionContext } from "./paws-session-context";

/** Return the paws session, its sign-in actions and the browser Supabase client from the nearest `PawsSessionProvider`. */
export function usePawsSession() {
  const value = useContext(PawsSessionContext);
  if (value === undefined)
    throw new Error("usePawsSession must be used inside PawsSessionProvider");
  return value;
}
