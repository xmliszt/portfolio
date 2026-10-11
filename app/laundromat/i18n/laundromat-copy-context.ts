"use client";

import { createContext } from "react";

import { en } from "@/lib/laundromat/i18n/copy/en";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

export type LaundromatCopyState = {
  copy: LaundromatCopy;
  setLocale: (locale: LaundromatLocale) => void;
};

export const LaundromatCopyContext = createContext<LaundromatCopyState>({
  copy: en,
  setLocale: () => {},
});
