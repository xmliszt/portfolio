"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { ViewfinderOrientation } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { cn } from "@/lib/utils";

const GRIP_BUTTON_CLASS =
  "flex w-16 cursor-pointer flex-col items-center gap-y-1 bg-transparent text-[9px] text-[var(--lm-ink)] lowercase transition-colors duration-200 outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed";

type CameraGripProps = {
  orientation: ViewfinderOrientation;
  busy: boolean;
  onPutDown: () => void;
  onShutter: () => void;
  onTurn: () => void;
};

/** Render the camera held at the bottom of the screen: put it down, press the red shutter, or turn it between portrait and landscape. */
export function CameraGrip(props: CameraGripProps) {
  const { copy } = useLaundromatCopy();
  const isPortrait = props.orientation === "portrait";
  return (
    <div className="relative flex items-center gap-x-6 rounded-t-2xl border border-b-0 border-[var(--lm-line)] bg-[var(--lm-panel)] px-3.5 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-1.5 right-5 left-5 h-1.5 rounded-t-sm border border-b-0 border-[var(--lm-line)]"
      />
      <button
        type="button"
        className={GRIP_BUTTON_CLASS}
        onClick={props.onPutDown}
      >
        <svg
          aria-hidden
          viewBox="0 0 18 18"
          className="size-4.5 fill-none stroke-current"
          strokeWidth={1.2}
          strokeLinecap="round"
        >
          <path d="M5 5l8 8M13 5l-8 8" />
        </svg>
        {copy.instantCamera.putDown}
      </button>
      <button
        type="button"
        aria-label={copy.instantCamera.shutter}
        disabled={props.busy}
        className="grid size-13 cursor-pointer place-items-center rounded-full border border-[var(--lm-line)] bg-[var(--lm-bg)] outline-none focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-[var(--lm-ink)] focus-visible:outline-dashed disabled:cursor-default"
        onClick={props.onShutter}
      >
        <span className="size-9.5 rounded-full bg-[#e2452f] shadow-[inset_0_-3px_0_rgba(0,0,0,0.25)] transition-transform duration-100 active:scale-90" />
      </button>
      <button
        type="button"
        aria-label={
          isPortrait
            ? copy.instantCamera.turnToLandscape
            : copy.instantCamera.turnToPortrait
        }
        className={GRIP_BUTTON_CLASS}
        onClick={props.onTurn}
      >
        <span aria-hidden className="grid size-4.5 place-items-center">
          <span
            className={cn(
              "rounded-[2px] border-[1.2px] border-current transition-[width,height] duration-300",
              isPortrait ? "h-3.5 w-2.5" : "h-2.5 w-3.5"
            )}
          />
        </span>
        {isPortrait
          ? copy.instantCamera.portrait
          : copy.instantCamera.landscape}
      </button>
    </div>
  );
}
