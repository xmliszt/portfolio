"use client";

import { useEffect, useRef } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { RenderQualityPreference } from "@/lib/laundromat/render-quality/render-quality";
import { RENDER_QUALITY_PREFERENCES } from "@/lib/laundromat/render-quality/render-quality";
import { cn } from "@/lib/utils";

import { RoomSoundsFieldset } from "./room-sounds-fieldset";
import { SETTINGS_META_CLASS } from "./settings-meta-class";
import { SettingsTicketPrinter } from "./settings-ticket-printer";
import { TemperatureUnitSwitch } from "./temperature-unit-switch";
import { useRenderQuality } from "./use-render-quality";

type SettingsDialogProps = {
  restoreCode: string | undefined;
  onRestoreRead: () => void;
  onClose: () => void;
};

export function SettingsDialog(props: SettingsDialogProps) {
  const { copy } = useLaundromatCopy();
  const { preference, detected, setPreference } = useRenderQuality();
  const selectedRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const qualityLabels = {
    full: copy.settings.qualityFull,
    lite: copy.settings.qualityLite,
  };
  const options = {
    auto: {
      label: copy.settings.qualityAuto,
      hint: copy.settings.qualityAutoHint({
        quality: qualityLabels[detected],
      }),
    },
    full: { label: qualityLabels.full, hint: copy.settings.qualityFullHint },
    lite: { label: qualityLabels.lite, hint: copy.settings.qualityLiteHint },
  } satisfies {
    [option in RenderQualityPreference]: { label: string; hint: string };
  };

  useEffect(() => {
    selectedRef.current?.focus({ preventScroll: true });
  }, []);

  const { onClose } = props;
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
        ...dialog.querySelectorAll<HTMLElement>(
          "input:checked, input[type=range], button"
        ),
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

  return (
    <div
      ref={dialogRef}
      data-settings-dialog
      role="dialog"
      aria-modal
      aria-labelledby="settings-dialog-heading"
      className="flex max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] flex-col gap-y-3 rounded-[22px] bg-[var(--lm-panel)] p-3.5 shadow-[0_1px_0_rgb(255_255_255/0.04)_inset,0_1px_2px_rgb(0_0_0/0.5),0_24px_64px_rgb(0_0_0/0.55)]"
    >
      <div
        data-settings-scroll
        className="flex min-h-0 flex-col gap-y-5 overflow-y-auto overscroll-contain rounded-lg px-5 pt-5 pb-4 text-[var(--lm-ink)] shadow-[0_0_0_1px_var(--lm-edge)] [scrollbar-color:var(--lm-line)_transparent] [scrollbar-width:thin]"
      >
        <h2
          id="settings-dialog-heading"
          className="m-0 font-[family-name:var(--lm-font-display)] text-[24px] leading-[1.1] font-normal lowercase"
        >
          {copy.settings.heading}
        </h2>
        <fieldset className="m-0 flex flex-col gap-y-3 border-0 p-0">
          <legend className={cn(SETTINGS_META_CLASS, "p-0 opacity-60")}>
            {copy.settings.rendering}
          </legend>
          <div className="flex flex-col gap-y-1">
            {RENDER_QUALITY_PREFERENCES.map((option) => (
              <label
                key={option}
                className="flex cursor-pointer items-start gap-x-3 rounded-md px-2 py-2 transition-colors hover:bg-[color-mix(in_oklab,var(--lm-ink)_6%,transparent)] has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-[var(--lm-edge)]"
              >
                <input
                  ref={option === preference ? selectedRef : undefined}
                  type="radio"
                  name="render-quality"
                  value={option}
                  checked={option === preference}
                  onChange={() => setPreference(option)}
                  className="mt-1 size-3 shrink-0 cursor-pointer appearance-none rounded-full shadow-[inset_0_0_0_1px_var(--lm-line)] outline-none checked:bg-[var(--lm-accent)] checked:shadow-[inset_0_0_0_1px_var(--lm-accent),inset_0_0_0_3px_var(--lm-panel)]"
                />
                <span className="flex flex-col gap-y-0.5">
                  <span className="text-[13px] leading-5 lowercase">
                    {options[option].label}
                  </span>
                  <span className={cn(SETTINGS_META_CLASS, "opacity-60")}>
                    {options[option].hint}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="m-0 font-[family-name:var(--lm-font-display)] text-[13px] leading-5 text-pretty opacity-60">
            {copy.settings.renderingHint}
          </p>
        </fieldset>
        <TemperatureUnitSwitch />
        <RoomSoundsFieldset />
        <SettingsTicketPrinter
          restoreCode={props.restoreCode}
          onRestoreRead={props.onRestoreRead}
        />
      </div>
      <div className="flex justify-end px-2">
        <button
          type="button"
          onClick={props.onClose}
          aria-keyshortcuts="Escape"
          title={copy.settings.closeHint}
          className="flex h-8 cursor-pointer items-center gap-x-2 rounded-md px-3 text-[13px] text-[var(--lm-ink)] lowercase outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
        >
          {copy.settings.close}
          <kbd className="rounded px-1 font-[family-name:var(--lm-font-mono)] text-[10px] leading-4 opacity-70 shadow-[inset_0_0_0_1px_var(--lm-edge)]">
            esc
          </kbd>
        </button>
      </div>
    </div>
  );
}
