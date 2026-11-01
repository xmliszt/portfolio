"use client";

import { Fragment } from "react";
import Link from "next/link";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PAWS_LEGAL_PAGES } from "@/lib/paws/legal/paws-legal-pages";
import { cn } from "@/lib/utils";

/** Render small links to the Paws privacy and terms pages, each opening in a new tab. */
export function PawsLegalLinks() {
  const { copy } = usePawsCopy();
  return (
    <nav className="flex items-center gap-x-1.5 text-[11px] text-[var(--pw-ink-soft)]">
      {(["privacy", "terms"] as const).map((page, index) => (
        <Fragment key={page}>
          {index > 0 && <span aria-hidden>·</span>}
          <Link
            href={PAWS_LEGAL_PAGES[page].path}
            prefetch={false}
            target="_blank"
            rel="noopener"
            className={cn(
              FOCUS_RING_CLASS,
              "underline decoration-[var(--pw-rule)] underline-offset-4 hover:text-[var(--pw-ink)] hover:decoration-[var(--pw-pink)]"
            )}
          >
            {copy.legal[page]}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
