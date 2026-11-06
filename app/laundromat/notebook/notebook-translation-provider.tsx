"use client";

import { useLayoutEffect, useState } from "react";

import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";

import type { NotebookTranslationTarget } from "./notebook-translation-context";
import { NotebookTranslationContext } from "./notebook-translation-context";

const TARGET_STORAGE_KEY = "laundromat:notebook-translation-target";
const AUTO_STORAGE_KEY = "laundromat:notebook-auto-translate";

type NotebookTranslationProviderProps = {
  children: React.ReactNode;
};

function readStoredTarget(): NotebookTranslationTarget {
  try {
    const stored = window.localStorage.getItem(TARGET_STORAGE_KEY);
    return LAUNDROMAT_LOCALES.find((locale) => locale === stored) ?? "auto";
  } catch {
    return "auto";
  }
}

function readStoredAuto() {
  try {
    return window.localStorage.getItem(AUTO_STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

function writeStored(options: { key: string; value: string }) {
  try {
    window.localStorage.setItem(options.key, options.value);
  } catch {
    return;
  }
}

/** Provide the visitor's remembered notebook translation settings: the language notes are translated into, `auto` for the laundromat's own language, and whether notes are translated without asking; `auto` and off until mounted. */
export function NotebookTranslationProvider(
  props: NotebookTranslationProviderProps
) {
  const [target, setTargetState] = useState<NotebookTranslationTarget>("auto");
  const [isAuto, setAutoState] = useState(false);

  useLayoutEffect(() => {
    setTargetState(readStoredTarget());
    setAutoState(readStoredAuto());
  }, []);

  function setTarget(next: NotebookTranslationTarget) {
    setTargetState(next);
    writeStored({ key: TARGET_STORAGE_KEY, value: next });
  }

  function setAuto(next: boolean) {
    setAutoState(next);
    writeStored({ key: AUTO_STORAGE_KEY, value: next ? "on" : "off" });
  }

  return (
    <NotebookTranslationContext.Provider
      value={{ target, isAuto, setTarget, setAuto }}
    >
      {props.children}
    </NotebookTranslationContext.Provider>
  );
}
