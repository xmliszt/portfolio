"use client";

import { createContext } from "react";

import { en } from "@/lib/paws/i18n/copy/en";
import type { PawsCopy } from "@/lib/paws/i18n/paws-copy";
import type { PawsLocale } from "@/lib/paws/i18n/paws-locales";

export type PawsCopyState = {
  copy: PawsCopy;
  setLocale: (locale: PawsLocale) => void;
};

export const PawsCopyContext = createContext<PawsCopyState>({
  copy: en,
  setLocale: () => {},
});
