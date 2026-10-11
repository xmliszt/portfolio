"use client";

import { PORTFOLIO_HOSTNAMES } from "@/lib/laundromat/hosts";
import { cn } from "@/lib/utils";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";
import { TOOLBAR_BUTTON_CLASS } from "./toolbar-button-class";
import { ToolbarLabel } from "./toolbar-label";

/** Link to the maker's portfolio in a new tab. */
export function PortfolioLink() {
  const { copy } = useLaundromatCopy();
  return (
    <a
      href={`https://${PORTFOLIO_HOSTNAMES[0]}`}
      target="_blank"
      rel="noopener"
      className={cn(TOOLBAR_BUTTON_CLASS, "normal-case")}
    >
      <svg
        aria-hidden
        viewBox="0 0 12 12"
        className="size-3 shrink-0 fill-none stroke-current"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 10C3.5 8.4 1.5 6.7 1.5 4.5 1.5 3.1 2.6 2 3.9 2c.9 0 1.6.5 2.1 1.2C6.5 2.5 7.2 2 8.1 2c1.3 0 2.4 1.1 2.4 2.5 0 2.2-2 3.9-4.5 5.5Z" />
      </svg>
      <ToolbarLabel>{copy.toolbar.builtBy}</ToolbarLabel>
    </a>
  );
}
