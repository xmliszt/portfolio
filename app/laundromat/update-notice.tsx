"use client";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";
import { TOOLBAR_BUTTON_CLASS } from "./toolbar-button-class";
import { ToolbarLabel } from "./toolbar-label";
import { useIsUpdateAvailable } from "./use-is-update-available";

/** Show a toolbar button that reloads the page once a newer laundromat build is deployed, and nothing before that. */
export function UpdateNotice() {
  const { copy } = useLaundromatCopy();
  const isUpdateAvailable = useIsUpdateAvailable();

  function handleReload() {
    window.location.reload();
  }

  if (!isUpdateAvailable) return null;
  return (
    <button
      type="button"
      className={TOOLBAR_BUTTON_CLASS}
      onClick={handleReload}
    >
      <span
        aria-hidden
        className="size-1.5 shrink-0 rounded-full bg-[var(--lm-accent)]"
      />
      <ToolbarLabel open role="status">
        {copy.toolbar.updateAvailable}
      </ToolbarLabel>
    </button>
  );
}
