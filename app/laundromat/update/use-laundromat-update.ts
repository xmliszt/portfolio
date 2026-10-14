"use client";

import { useContext } from "react";

import { LaundromatUpdateContext } from "./laundromat-update-context";

/** Return whether the deployed laundromat runs a different build than this tab and, once it does, the board entries to show in the visitor's language. */
export function useLaundromatUpdate() {
  return useContext(LaundromatUpdateContext);
}
