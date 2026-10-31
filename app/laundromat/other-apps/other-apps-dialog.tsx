"use client";

import { useEffect, useId, useRef } from "react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { SquircleAppIcon } from "@/components/ui/squircle-app-icon";
import { getSiblingApps } from "@/lib/apps/get-sibling-apps";

type OtherAppsDialogProps = { onClose: () => void };

/** Render a panel of the maker's other apps as home-screen icons, each opening in a new tab, closing on Escape or the close button and keeping Tab inside it. */
export function OtherAppsDialog(props: OtherAppsDialogProps) {
  const { copy } = useLaundromatCopy();
  const dialogRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const hintId = useId();
  const { onClose } = props;

  useEffect(() => {
    dialogRef.current
      ?.querySelector<HTMLAnchorElement>("a")
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
      const focusable = [...dialog.querySelectorAll<HTMLElement>("a, button")];
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
      role="dialog"
      aria-modal
      aria-labelledby={headingId}
      aria-describedby={hintId}
      className="flex max-h-[calc(100dvh-32px)] w-[min(360px,calc(100vw-32px))] flex-col gap-y-3 rounded-[22px] bg-[var(--lm-panel)] p-3.5 text-[var(--lm-ink)] [box-shadow:var(--lm-panel-shadow)]"
    >
      <div className="flex min-h-0 flex-col gap-y-4 overflow-y-auto overscroll-contain rounded-lg px-5 pt-5 pb-5 lowercase shadow-[0_0_0_1px_var(--lm-edge)] [scrollbar-color:var(--lm-line)_transparent] [scrollbar-width:thin]">
        <h2
          id={headingId}
          className="m-0 font-[family-name:var(--lm-font-display)] text-[24px] leading-[1.1] font-normal lowercase"
        >
          {copy.otherApps.heading}
        </h2>
        <p
          id={hintId}
          className="m-0 text-[11px] leading-5 text-pretty opacity-80"
        >
          {copy.otherApps.hint}
        </p>
        <ul className="m-0 grid list-none grid-cols-4 gap-x-2 gap-y-4 p-0">
          {getSiblingApps("laundromat").map((app) => (
            <li key={app.id} className="m-0 p-0">
              <a
                href={app.href}
                target="_blank"
                rel="noopener"
                className="group flex flex-col items-center gap-y-2 rounded-lg py-1 text-[11px] leading-4 normal-case outline-none hover:text-[var(--lm-ink-hi)] focus-visible:ring-1 focus-visible:ring-[var(--lm-edge)]"
              >
                <SquircleAppIcon
                  src={app.iconSrc}
                  sizePx={52}
                  className="transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-active:scale-95 motion-reduce:transition-none"
                />
                <span className="max-w-full truncate">{app.name}</span>
              </a>
            </li>
          ))}
        </ul>
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
