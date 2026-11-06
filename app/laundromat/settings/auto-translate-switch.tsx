"use client";

import { useId } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useNotebookTranslation } from "@/app/laundromat/notebook/use-notebook-translation";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { cn } from "@/lib/utils";

import { SETTINGS_META_CLASS } from "./settings-meta-class";

const STATES = ["on", "off"] as const;

/** Let the visitor turn automatic notebook translation on or off with a two-position slider. */
export function AutoTranslateSwitch() {
  const { copy } = useLaundromatCopy();
  const { isAuto, setAuto } = useNotebookTranslation();
  const sound = useSoundBoard();
  const selected = isAuto ? "on" : "off";
  const labelId = useId();

  function choose(next: (typeof STATES)[number]) {
    if (next === selected) return;
    sound?.play("knob-click");
    setAuto(next === "on");
  }

  return (
    <div className="flex items-center justify-between gap-x-3">
      <span id={labelId} className={cn(SETTINGS_META_CLASS, "opacity-80")}>
        {copy.settings.autoTranslate}
      </span>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        className="relative grid grid-cols-2 rounded-full p-0.5 shadow-[inset_0_0_0_1px_var(--lm-edge)]"
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-[var(--lm-accent)] transition-transform duration-200 ease-out motion-reduce:transition-none",
            !isAuto && "translate-x-full"
          )}
        />
        {STATES.map((option) => (
          <label
            key={option}
            className={cn(
              "relative flex h-7 w-11 cursor-pointer items-center justify-center rounded-full font-[family-name:var(--lm-font-mono)] text-[13px] lowercase transition-colors has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-[var(--lm-ink-hi)]",
              option === selected
                ? "text-[var(--lm-panel)]"
                : "text-[var(--lm-ink)] hover:text-[var(--lm-ink-hi)]"
            )}
          >
            <input
              type="radio"
              name="auto-translate"
              value={option}
              checked={option === selected}
              onChange={() => choose(option)}
              className="sr-only"
            />
            {copy.settings.autoTranslateStates[option]}
          </label>
        ))}
      </div>
    </div>
  );
}
