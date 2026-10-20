"use client";

import { Fragment } from "react";
import Link from "next/link";

import { INSPIRATION_BOOK } from "@/lib/laundromat/inspiration-book";
import { LEGAL_PAGES } from "@/lib/laundromat/legal/legal-pages";

import { useLaundromatCopy } from "./i18n/use-laundromat-copy";

const CREDIT_LINK_CLASS =
  "outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed";

/** Render the laundromat's screen-reader heading, introduction, and book credit in the visitor's language followed by the English privacy and terms links, showing the credit while one of its links has keyboard focus. */
export function LaundromatIntro() {
  const { copy } = useLaundromatCopy();
  return (
    <>
      <h1 className="sr-only">{copy.site.name}</h1>
      <p className="sr-only">{copy.site.intro}</p>
      <p className="sr-only text-[11px] text-[var(--lm-ink)] focus-within:not-sr-only focus-within:fixed focus-within:bottom-[max(1.5rem,env(safe-area-inset-bottom))] focus-within:left-[max(1.75rem,env(safe-area-inset-left))] focus-within:z-20">
        {copy.site.inspiredBy}{" "}
        <a
          href={INSPIRATION_BOOK.url}
          target="_blank"
          rel="noopener"
          className={CREDIT_LINK_CLASS}
        >
          {INSPIRATION_BOOK.title} ({INSPIRATION_BOOK.originalTitle})
        </a>
        {" · "}
        <a
          href={INSPIRATION_BOOK.authorUrl}
          target="_blank"
          rel="noopener"
          className={CREDIT_LINK_CLASS}
        >
          {INSPIRATION_BOOK.author} ({INSPIRATION_BOOK.originalAuthor})
        </a>
        {" · "}
        <a
          href={INSPIRATION_BOOK.authorInstagramUrl}
          target="_blank"
          rel="noopener"
          className={CREDIT_LINK_CLASS}
        >
          @{INSPIRATION_BOOK.authorInstagramHandle}
        </a>
        {Object.values(LEGAL_PAGES).map((page) => (
          <Fragment key={page.path}>
            {" · "}
            <Link
              href={page.path}
              prefetch={false}
              className={CREDIT_LINK_CLASS}
            >
              {page.title}
            </Link>
          </Fragment>
        ))}
      </p>
    </>
  );
}
