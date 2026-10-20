import Link from "next/link";

import { en } from "@/lib/laundromat/i18n/copy/en";
import { LEGAL_CONTACT_EMAIL } from "@/lib/laundromat/legal/legal-contact-email";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/laundromat/legal/legal-effective-date";
import { LEGAL_PAGES } from "@/lib/laundromat/legal/legal-pages";

const NAV_LINK_CLASS =
  "outline-none hover:text-[var(--lm-ink-hi)] focus-visible:text-[var(--lm-ink-hi)] focus-visible:outline-1 focus-visible:outline-[var(--lm-line)] focus-visible:outline-dashed";

type LegalPageProps = {
  page: keyof typeof LEGAL_PAGES;
  intro: string;
  children: React.ReactNode;
};

/** Render a scrolling legal page with links home and to the other legal pages, its title, effective date and `intro`, the sections in `children`, and the contact email. */
export function LegalPage(props: LegalPageProps) {
  const { title } = LEGAL_PAGES[props.page];
  const links = (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 font-[family-name:var(--lm-font-mono)] text-[11px] lowercase">
      <Link href="/" className={NAV_LINK_CLASS}>
        ← {en.site.name}
      </Link>
      <span className="flex items-center gap-x-3">
        {Object.entries(LEGAL_PAGES).map(([key, page]) =>
          key === props.page ? (
            <span
              key={key}
              aria-current="page"
              className="text-[var(--lm-ink-hi)]"
            >
              {page.title}
            </span>
          ) : (
            <Link key={key} href={page.path} className={NAV_LINK_CLASS}>
              {page.title}
            </Link>
          )
        )}
      </span>
    </div>
  );
  return (
    <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-color:var(--lm-line)_transparent] [scrollbar-width:thin]">
      <article className="mx-auto flex w-full max-w-[640px] flex-col gap-y-12 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-16 sm:pb-20">
        <nav aria-label="legal pages">{links}</nav>
        <header className="flex flex-col gap-y-4">
          <h1 className="m-0 font-[family-name:var(--lm-font-display)] text-[34px] leading-[1.1] font-normal text-[var(--lm-ink-hi)] lowercase">
            {title}
          </h1>
          <p className="font-[family-name:var(--lm-font-mono)] text-[11px] lowercase opacity-60">
            effective {LEGAL_EFFECTIVE_DATE}
          </p>
          <p className="font-[family-name:var(--lm-font-display)] text-[15px] leading-[1.7] text-pretty">
            {props.intro}
          </p>
        </header>
        {props.children}
        <footer className="flex flex-col gap-y-8 border-t border-[var(--lm-edge)] pt-6">
          <p className="font-[family-name:var(--lm-font-display)] text-[15px] leading-[1.7] text-pretty">
            Questions? Email{" "}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className="text-[var(--lm-ink-hi)] underline decoration-[var(--lm-line)] underline-offset-4 hover:decoration-[var(--lm-ink-hi)]"
            >
              {LEGAL_CONTACT_EMAIL}
            </a>
            .
          </p>
          {links}
        </footer>
      </article>
    </div>
  );
}
