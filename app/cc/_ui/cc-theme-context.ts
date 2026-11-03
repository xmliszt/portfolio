"use client";

import { createContext } from "react";

import type { CcThemePreference } from "@/lib/cc/theme/cc-theme";

export const CcThemeContext = createContext<
  | {
      preference: CcThemePreference;
      setPreference: (preference: CcThemePreference) => void;
    }
  | undefined
>(undefined);
