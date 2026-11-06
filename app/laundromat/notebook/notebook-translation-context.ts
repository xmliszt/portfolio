"use client";

import { createContext } from "react";

import type { LaundromatLocale } from "@/lib/laundromat/i18n/laundromat-locales";

export type NotebookTranslationTarget = "auto" | LaundromatLocale;

export type NotebookTranslationSetting = {
  target: NotebookTranslationTarget;
  isAuto: boolean;
  setTarget: (target: NotebookTranslationTarget) => void;
  setAuto: (isAuto: boolean) => void;
};

export const NotebookTranslationContext =
  createContext<NotebookTranslationSetting>({
    target: "auto",
    isAuto: true,
    setTarget: () => {},
    setAuto: () => {},
  });
