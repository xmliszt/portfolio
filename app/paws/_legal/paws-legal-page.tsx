import Link from "next/link";

import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { LEGAL_CONTACT_EMAIL } from "@/lib/laundromat/legal/legal-contact-email";
import { PAWS_LEGAL_EFFECTIVE_DATE } from "@/lib/paws/legal/paws-legal-effective-date";
import { PAWS_LEGAL_PAGES } from "@/lib/paws/legal/paws-legal-pages";
import { PAWS_SEO } from "@/lib/paws/paws-seo";
import { cn } from "@/lib/utils";

const NAV_LINK_CLASS = cn(
  FOCUS_RING_CLASS,
  "text-[var(--pw-ink-soft)] hover:text-[var(--pw-ink)]"
);

type PawsLegalPageProps = {
  page: keyof typeof PAWS_LEGAL_PAGES;
  intro: string;
  children: React.ReactNode;
};

/** Render a scrolling Paws legal page with links home and to the other legal page, its title, effective date and `intro`, the sections in `children`, and the contact email. */
export function PawsLegalPage(props: PawsLegalPageProps) {
  const { title } = PAWS_LEGAL_PAGES[props.page];
  const links = (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12px] lowercase">
      <Link href="/" className={NAV_LINK_CLASS}>
        ← {PAWS_SEO.name}
      </Link>
      <span className="flex items-center gap-x-3">
        {Object.entries(PAWS_LEGAL_PAGES).map(([key, page]) =>
          key === props.page ? (
            <span
              key={key}
              aria-current="page"
              className="text-[var(--pw-ink)] underline decoration-[var(--pw-pink)] decoration-[1.5px] underline-offset-4"
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
    <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-color:var(--pw-rule)_transparent] [scrollbar-width:thin]">
      <article className="mx-auto flex w-full max-w-[640px] flex-col gap-y-10 px-4 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))] select-text sm:px-8 sm:pt-16 sm:pb-20">
        <nav aria-label="legal pages">{links}</nav>
        <header className="flex flex-col gap-y-4 border-[1.5px] border-[var(--pw-ink)] p-5 sm:p-6">
          <h1 className="m-0 font-[family-name:var(--pw-font-display)] text-[34px] leading-[1.1] font-normal lowercase">
            {title}
          </h1>
          <p className="text-[12px] text-[var(--pw-ink-soft)] lowercase">
            effective {PAWS_LEGAL_EFFECTIVE_DATE}
          </p>
          <p className="text-[13px] leading-relaxed text-pretty">
            {props.intro}
          </p>
        </header>
        {props.children}
        <footer className="flex flex-col gap-y-8 border-t-[1.5px] border-[var(--pw-ink)] pt-6">
          <p className="text-[13px] leading-relaxed text-pretty">
            Questions? Email{" "}
            <a
              href={`mailto:${LEGAL_CONTACT_EMAIL}`}
              className={cn(
                FOCUS_RING_CLASS,
                "underline decoration-[var(--pw-pink)] decoration-[1.5px] underline-offset-4"
              )}
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
