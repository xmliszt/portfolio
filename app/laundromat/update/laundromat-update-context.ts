"use client";

import { createContext } from "react";

import type { BoardEntry } from "@/lib/laundromat/board/parse-board-entries";

export type LaundromatUpdate =
  | { kind: "current" }
  | { kind: "ready"; entries: BoardEntry[]; hasNewEntries: boolean };

export const LaundromatUpdateContext = createContext<LaundromatUpdate>({
  kind: "current",
});
