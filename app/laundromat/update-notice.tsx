"use client";

import { cn } from "@/lib/utils";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";
import { TOOLBAR_BUTTON_CLASS } from "./toolbar-button-class";
import { ToolbarLabel } from "./toolbar-label";
import { useIsUpdateAvailable } from "./use-is-update-available";

const WAVE_STEP_S = 0.07;

const KEYFRAMES = `
@keyframes lm-update-halo {
  0%, 100% { opacity: 0.12; transform: scale(0.9); }
  50% { opacity: 0.4; transform: scale(1.3); }
}
@keyframes lm-update-glow {
  0%, 100% { text-shadow: 0 0 0 transparent; }
  50% { text-shadow: 0 0 6px color-mix(in srgb, var(--lm-accent) 45%, transparent); }
}
`;

/** Show a toolbar button in the accent colour, with a glow that breathes across the dot and then each character, that reloads the page once a newer laundromat build is deployed, and nothing before that. */
export function UpdateNotice() {
  const { copy } = useLaundromatCopy();
  const isUpdateAvailable = useIsUpdateAvailable();

  function handleReload() {
    window.location.reload();
  }

  if (!isUpdateAvailable) return null;
  const label = copy.toolbar.updateAvailable;
  return (
    <>
      <style>{KEYFRAMES}</style>
      <button
        type="button"
        className={cn(
          TOOLBAR_BUTTON_CLASS,
          "text-[var(--lm-accent)] hover:text-[var(--lm-accent-hi)] focus-visible:text-[var(--lm-accent-hi)]"
        )}
        onClick={handleReload}
      >
        <span aria-hidden className="relative size-1.5 shrink-0">
          <span className="absolute -inset-1 animate-[lm-update-halo_2.8s_ease-in-out_infinite] rounded-full bg-[var(--lm-accent)] blur-[3px] motion-reduce:animate-none motion-reduce:opacity-20" />
          <span className="absolute inset-0 rounded-full bg-[var(--lm-accent)]" />
        </span>
        <ToolbarLabel open role="status">
          <span className="sr-only">{label}</span>
          <span aria-hidden>
            {Array.from(label).map((character, index) => (
              <span
                key={index}
                className="animate-[lm-update-glow_2.8s_ease-in-out_infinite] motion-reduce:animate-none"
                style={{ animationDelay: `${(index + 1) * WAVE_STEP_S}s` }}
              >
                {character}
              </span>
            ))}
          </span>
        </ToolbarLabel>
      </button>
    </>
  );
}
