"use client";

import { useContext } from "react";

import { PawsCopyContext } from "./paws-copy-context";

/** Return the visitor's Paws copy and the setter that switches it. */
export function usePawsCopy() {
  return useContext(PawsCopyContext);
}
