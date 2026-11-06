"use client";

import { useId } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { cn } from "@/lib/utils";

import { AutoTranslateSwitch } from "./auto-translate-switch";
import { NotebookLanguagePicker } from "./notebook-language-picker";
import { SETTINGS_META_CLASS } from "./settings-meta-class";

/** Group the notebook settings: the language notes are translated into and whether they are translated without asking. */
export function NotebookFieldset() {
  const { copy } = useLaundromatCopy();
  const labelId = useId();
  return (
    <fieldset className="m-0 flex flex-col gap-y-3 border-0 p-0">
      <legend className="sr-only">{copy.settings.notebook}</legend>
      <span aria-hidden className={cn(SETTINGS_META_CLASS, "opacity-80")}>
        {copy.settings.notebook}
      </span>
      <div className="flex flex-col gap-y-2">
        <span id={labelId} className={cn(SETTINGS_META_CLASS, "opacity-80")}>
          {copy.settings.translateTo}
        </span>
        <NotebookLanguagePicker labelId={labelId} />
      </div>
      <AutoTranslateSwitch />
    </fieldset>
  );
}
