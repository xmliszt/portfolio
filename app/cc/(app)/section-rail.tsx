"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ThemeControl } from "@/app/cc/_ui/theme-control";
import { cn } from "@/lib/utils";

import { signOut } from "./sign-out";

type SectionRailProps = {
  dueLogCount: number;
  telegramLinked: boolean;
  settingsNeedAttention: boolean;
};

const SECTIONS = [
  { href: "/", label: "OVERVIEW" },
  { href: "/calendar", label: "CALENDAR" },
  { href: "/composer", label: "COMPOSER" },
  { href: "/log", label: "LOG" },
  { href: "/insights", label: "INSIGHTS" },
  { href: "/new", label: "NEW" },
  { href: "/settings", label: "SETTINGS" },
] as const;

export function SectionRail(props: SectionRailProps) {
  const pathname = usePathname().replace(/^\/cc(?=\/|$)/, "") || "/";

  return (
    <nav
      aria-label="Sections"
      className="bg-card flex w-full flex-col gap-y-1 border-b px-2 py-3 md:sticky md:top-0 md:h-dvh md:w-[160px] md:flex-none md:border-r md:border-b-0"
    >
      <Link
        href="/"
        className="text-primary px-2 pb-2 font-[family-name:var(--cc-font-display)] text-[13px] font-bold tracking-[0.06em]"
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
                "flex h-7 items-center gap-x-2 border-l-2 px-2 text-[11px] tracking-[0.04em]",
                isCurrent
                  ? "border-primary bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-cc-panel-2 border-transparent"
              )}
            >
              {section.label}
              {section.href === "/log" && props.dueLogCount > 0 && (
                <span className="bg-cc-warn text-background ml-auto px-1 text-[10.5px] font-bold">
                  {props.dueLogCount}
                </span>
              )}
              {section.href === "/settings" && props.settingsNeedAttention && (
                <span className="text-cc-warn ml-auto text-[10.5px]">
                  <span aria-hidden>●</span>
                  <span className="sr-only">Threads needs connecting</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
      <div className="text-muted-foreground flex flex-col gap-y-1 border-t px-2 pt-2 text-[10.5px] md:mt-auto">
        <ThemeControl />
        <span>TZ ASIA/SINGAPORE</span>
        <span className="whitespace-nowrap">
          TELEGRAM{" "}
          <span
            className={props.telegramLinked ? "text-cc-ok" : "text-cc-warn"}
          >
            ● {props.telegramLinked ? "LINKED" : "OFF"}
          </span>
        </span>
        <form action={signOut}>
          <button type="submit" className="hover:text-foreground h-6 text-left">
            SIGN OUT
          </button>
        </form>
      </div>
    </nav>
  );
}
