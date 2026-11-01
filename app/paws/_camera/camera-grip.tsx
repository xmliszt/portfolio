"use client";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import type { ViewfinderOrientation } from "@/lib/laundromat/instant-camera/viewfinder-frame";
import { cn } from "@/lib/utils";

const GRIP_BUTTON_CLASS = cn(
  FOCUS_RING_CLASS,
  "flex w-16 flex-col items-center gap-y-1 text-[11px] text-[var(--pw-ink-soft)] transition-colors hover:text-[var(--pw-ink)]"
);

type CameraGripProps = {
  orientation: ViewfinderOrientation;
  busy: boolean;
  onPutDown: () => void;
  onShutter: () => void;
  onTurn: () => void;
};

/** Render the camera held at the bottom of the room: put it down, press the shutter, or turn it between portrait and landscape. */
export function CameraGrip(props: CameraGripProps) {
  const { copy } = usePawsCopy();
  const isPortrait = props.orientation === "portrait";
  return (
    <div className="flex items-center gap-x-6 border-[1.5px] border-b-0 border-[var(--pw-ink)] bg-[var(--pw-paper)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[3px_-2px_0_var(--pw-pink)]">
      <button
        type="button"
        className={GRIP_BUTTON_CLASS}
        onClick={props.onPutDown}
      >
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="size-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 2l8 8M10 2l-8 8" />
        </svg>
        {copy.camera.putDown}
      </button>
      <button
        type="button"
        aria-label={copy.camera.shutter}
        disabled={props.busy}
        className={cn(
          FOCUS_RING_CLASS,
          "grid size-14 place-items-center rounded-full border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper-deep)] disabled:cursor-default"
        )}
        onClick={props.onShutter}
      >
        <span className="size-10 rounded-full border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-pink)] transition-transform duration-100 active:scale-90 motion-reduce:transition-none" />
      </button>
      <button
        type="button"
        aria-label={
          isPortrait ? copy.camera.turnToLandscape : copy.camera.turnToPortrait
        }
        className={GRIP_BUTTON_CLASS}
        onClick={props.onTurn}
      >
        <span aria-hidden className="grid size-3.5 place-items-center">
          <span
            className={cn(
              "border-[1.5px] border-current transition-[width,height] duration-300 motion-reduce:transition-none",
              isPortrait ? "h-3.5 w-2.5" : "h-2.5 w-3.5"
            )}
          />
        </span>
        {isPortrait ? copy.camera.portrait : copy.camera.landscape}
      </button>
    </div>
  );
}
