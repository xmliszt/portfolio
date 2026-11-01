"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { signOut } from "./sign-out";

type SectionRailProps = {
  dueLogCount: number;
  telegramLinked: boolean;
};

const SECTIONS = [
  { href: "/", label: "OVERVIEW" },
  { href: "/calendar", label: "CALENDAR" },
  { href: "/composer", label: "COMPOSER" },
  { href: "/log", label: "LOG NUMBERS" },
  { href: "/insights", label: "INSIGHTS" },
] as const;

export function SectionRail(props: SectionRailProps) {
  const pathname = usePathname().replace(/^\/cc(?=\/|$)/, "") || "/";

  return (
    <nav
      aria-label="Sections"
      className="flex w-full flex-col gap-y-1.5 border-b px-4 py-5 md:sticky md:top-0 md:h-dvh md:w-[200px] md:flex-none md:border-r md:border-b-0 md:py-6"
    >
      <Link
        href="/"
        className="text-primary px-2 pb-4 font-[family-name:var(--cc-font-display)] text-xl font-bold tracking-[0.08em]"
      >
        CC//
      </Link>
      <div className="flex flex-wrap gap-x-1.5 gap-y-1.5 md:flex-col">
        {SECTIONS.map((section) => {
          const isCurrent =
            section.href === "/"
              ? pathname === "/"
              : pathname.startsWith(section.href);
          return (
            <Link
              key={section.href}
              href={section.href}
              aria-current={isCurrent ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-x-2.5 border px-3",
                isCurrent
                  ? "border-primary bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              )}
            >
              {isCurrent && <span aria-hidden>▸</span>}
              {section.label}
              {section.href === "/log" && props.dueLogCount > 0 && (
                <span className="bg-cc-warn text-background ml-auto px-1.5 font-bold">
                  {props.dueLogCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="text-muted-foreground mt-4 flex flex-col gap-y-2 border-t px-2 pt-3 text-[11px] leading-relaxed md:mt-auto">
        <span>TZ ASIA/SINGAPORE</span>
        <span>
          TELEGRAM{" "}
          <span
            className={props.telegramLinked ? "text-cc-ok" : "text-cc-warn"}
          >
            ● {props.telegramLinked ? "LINKED" : "NOT SET UP"}
          </span>
        </span>
        <form action={signOut}>
          <button type="submit" className="hover:text-foreground min-h-8">
            SIGN OUT
          </button>
        </form>
      </div>
    </nav>
  );
}
