"use client";

import { useContext } from "react";

import { LaundromatCopyContext } from "./laundromat-copy-context";

/** Return the visitor's laundromat copy and the setter that switches it. */
export function useLaundromatCopy() {
  return useContext(LaundromatCopyContext);
}
