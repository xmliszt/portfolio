"use client";

import { useContext, useEffect, useId, useRef } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { parseThemeId } from "@/lib/laundromat/themes/parse-theme-id";
import { themes } from "@/lib/laundromat/themes/themes";

import { SceneThemeContext } from "./scene-theme-context";
import { SeasonalSwitch } from "./seasonal-switch";

const RADIO_CLASS =
  "size-3 shrink-0 cursor-pointer appearance-none rounded-full shadow-[inset_0_0_0_1px_var(--lm-line)] outline-none checked:bg-[var(--lm-accent)] checked:shadow-[inset_0_0_0_1px_var(--lm-accent),inset_0_0_0_3px_var(--lm-panel)]";

type ThemeDialogProps = { onClose: () => void };

export function ThemeDialog(props: ThemeDialogProps) {
  const theme = useContext(SceneThemeContext);
  const { copy } = useLaundromatCopy();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const hintId = useId();
  const { onClose } = props;

  useEffect(() => {
    dialogRef.current
      ?.querySelector<HTMLButtonElement>('[role="switch"]')
      ?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      const dialog = dialogRef.current;
      if (event.key !== "Tab" || dialog === null) return;
      const focusable = [
        ...dialog.querySelectorAll<HTMLElement>("input:checked, button"),
      ];
      const first = focusable.at(0);
      const last = focusable.at(-1);
      const isInside = dialog.contains(document.activeElement);
      const wrapTo = event.shiftKey
        ? (!isInside || document.activeElement === first) && last
        : (!isInside || document.activeElement === last) && first;
      if (!wrapTo) return;
      event.preventDefault();
      wrapTo.focus();
    }
    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () =>
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [onClose]);

  if (theme?.kind !== "visitor") return null;

  return (
    <div
      ref={dialogRef}
      data-theme-dialog
      role="dialog"
      aria-modal
      aria-labelledby={headingId}
      aria-describedby={hintId}
      className="flex max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] flex-col gap-y-3 rounded-[22px] bg-[var(--lm-panel)] p-3.5 text-[var(--lm-ink)] [box-shadow:var(--lm-panel-shadow)]"
    >
      <div className="flex min-h-0 flex-col gap-y-4 overflow-y-auto overscroll-contain rounded-lg px-5 pt-5 pb-4 lowercase shadow-[0_0_0_1px_var(--lm-edge)] [scrollbar-color:var(--lm-line)_transparent] [scrollbar-width:thin]">
        <h2
          id={headingId}
          className="m-0 font-[family-name:var(--lm-font-display)] text-[24px] leading-[1.1] font-normal lowercase"
        >
          {copy.themes.heading}
        </h2>
        <p
          id={hintId}
          className="m-0 text-[11px] leading-5 text-pretty opacity-80"
        >
          {copy.themes.hint}
        </p>
        <SeasonalSwitch
          on={theme.preference.kind === "automatic"}
          onToggle={() =>
            theme.setPreference(
              theme.preference.kind === "automatic"
                ? { kind: "manual", themeId: theme.themeId }
                : { kind: "automatic" }
            )
          }
        />
        <fieldset className="m-0 flex flex-col gap-y-3 border-0 p-0">
          <legend className="sr-only">{copy.themes.heading}</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            {Object.entries(themes).map(([id, definition]) => {
              const themeId = parseThemeId(id);
              if (themeId === undefined) return null;
              return (
                <label
                  key={id}
                  className="flex cursor-pointer flex-col gap-y-2 rounded-lg p-2 shadow-[inset_0_0_0_1px_var(--lm-edge)] has-[:checked]:shadow-[inset_0_0_0_1px_var(--lm-accent)] has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-[var(--lm-accent)]"
                >
                  <img
                    src={definition.thumbnail}
                    alt=""
                    width={160}
                    height={120}
                    className="aspect-[4/3] w-full rounded-[4px] object-cover outline-1 -outline-offset-1 outline-[var(--lm-edge)]"
                  />
                  <span className="flex min-h-7 items-center gap-x-2 text-[12px]">
                    <input
                      type="radio"
                      name={headingId}
                      checked={theme.themeId === themeId}
                      onClick={() => {
                        if (
                          theme.preference.kind === "automatic" &&
                          theme.themeId === themeId
                        )
                          theme.setPreference({ kind: "manual", themeId });
                      }}
                      onChange={() =>
                        theme.setPreference({ kind: "manual", themeId })
                      }
                      className={RADIO_CLASS}
                    />
                    {copy.themes.names[themeId]}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
      <button
        type="button"
        onClick={props.onClose}
        aria-keyshortcuts="Escape"
        title={copy.settings.closeHint}
        className="flex min-h-11 items-center gap-x-2 self-end rounded-md px-3 text-[13px] lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
      >
        {copy.settings.close}
        <kbd className="rounded px-1 font-[family-name:var(--lm-font-mono)] text-[10px] leading-4 opacity-80 shadow-[inset_0_0_0_1px_var(--lm-edge)]">
          esc
        </kbd>
      </button>
    </div>
  );
}
