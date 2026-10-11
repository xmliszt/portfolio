"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";

import { useSoundMuted } from "./use-sound-muted";

/** Toggle `muted` from `useSoundMuted`, labelled `copy.toolbar.soundOn` or `copy.toolbar.soundOff`. */
export function SoundToggle() {
  const { muted: isMuted, setMuted } = useSoundMuted();
  const { copy } = useLaundromatCopy();

  function handleToggle() {
    setMuted(!isMuted);
  }

  return (
    <button
      type="button"
      aria-pressed={!isMuted}
      className="flex cursor-pointer items-center gap-x-1.5 bg-transparent px-1.5 py-2 text-[11px] text-[var(--lm-line)] lowercase transition-colors duration-200 outline-none hover:text-[var(--lm-ink)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed"
      onClick={handleToggle}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3 fill-none stroke-current"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1.5 4.5h2l3-2.5v8l-3-2.5h-2z" />
        {isMuted ? (
          <path d="M8.5 4.5l3 3M11.5 4.5l-3 3" />
        ) : (
          <path d="M8.5 4a3 3 0 0 1 0 4M10 2.5a5 5 0 0 1 0 7" />
        )}
      </svg>
      {isMuted ? copy.toolbar.soundOff : copy.toolbar.soundOn}
    </button>
  );
}
