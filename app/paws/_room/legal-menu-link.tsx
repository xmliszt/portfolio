import Link from "next/link";

import { usePawsCopy } from "@/app/paws/_i18n/use-paws-copy";
import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { PAWS_LEGAL_PAGES } from "@/lib/paws/legal/paws-legal-pages";
import { cn } from "@/lib/utils";

type LegalMenuLinkProps = {
  page: keyof typeof PAWS_LEGAL_PAGES;
};

function LegalIcon(props: LegalMenuLinkProps) {
  switch (props.page) {
    case "privacy":
      return (
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        >
          <rect
            x="2.5"
            y="6"
            width="9"
            height="6.5"
            className="transition-colors group-hover:fill-[var(--pw-blue)] group-focus-visible:fill-[var(--pw-blue)]"
          />
          <path d="M4.5 6V4.5a2.5 2.5 0 0 1 5 0V6" />
        </svg>
      );
    case "terms":
      return (
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          className="size-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        >
          <path
            d="M3 1.5h5.5L11 4v8.5H3Z"
            className="transition-colors group-hover:fill-[var(--pw-yellow)] group-focus-visible:fill-[var(--pw-yellow)]"
          />
          <path d="M5 6.5h4M5 9h4" />
        </svg>
      );
    default: {
      const unknown: never = props.page;
      return unknown;
    }
  }
}

/** Render a menu row that opens the Paws legal `page` in a new tab: its icon and label in the menu's bordered row. */
export function LegalMenuLink(props: LegalMenuLinkProps) {
  const { copy } = usePawsCopy();
  return (
    <Link
      href={PAWS_LEGAL_PAGES[props.page].path}
      prefetch={false}
      target="_blank"
      rel="noopener"
      className={cn(
        FOCUS_RING_CLASS,
        "group flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      <LegalIcon page={props.page} />
      <span className="min-w-0 flex-1 truncate text-left">
        {copy.legal[props.page]}
      </span>
    </Link>
  );
}
