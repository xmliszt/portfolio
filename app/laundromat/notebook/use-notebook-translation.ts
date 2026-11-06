"use client";

import { useContext } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";

import { NotebookTranslationContext } from "./notebook-translation-context";

/** Return the notebook translation settings with `locale`, the language notes are translated into: the laundromat's own language when `target` is `auto`. */
export function useNotebookTranslation() {
  const setting = useContext(NotebookTranslationContext);
  const { copy } = useLaundromatCopy();
  return {
    ...setting,
    locale: setting.target === "auto" ? copy.locale : setting.target,
  };
}
