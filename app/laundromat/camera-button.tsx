"use client";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";
import { TOOLBAR_BUTTON_CLASS } from "./toolbar-button-class";
import { ToolbarLabel } from "./toolbar-label";

type CameraButtonProps = {
  onPickUp: () => void;
};

/** Pick up the instant camera from the toolbar, wherever the visitor is. */
export function CameraButton(props: CameraButtonProps) {
  const { copy } = useLaundromatCopy();
  return (
    <button
      type="button"
      className={TOOLBAR_BUTTON_CLASS}
      onClick={props.onPickUp}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3 shrink-0 fill-none stroke-current"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M1.5 4.2h2.1l.9-1.4h3l.9 1.4h2.1v5.3h-9z" />
        <circle cx={6} cy={6.7} r={1.7} />
      </svg>
      <ToolbarLabel>{copy.instantCamera.toolbar}</ToolbarLabel>
    </button>
  );
}
