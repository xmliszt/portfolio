"use client";

import { useEffect, useRef } from "react";
import groupBy from "lodash/groupBy.js";
import Link from "next/link";

import { PlatformChip } from "@/app/cc/_ui/platform-chip";
import { StatusDot } from "@/app/cc/_ui/status-dot";
import { cn } from "@/lib/utils";

import type { ComposerTab } from "./composer-tab";

type ComposerTabsProps = {
  tabs: readonly ComposerTab[];
  selectedPostId: string;
};

export function ComposerTabs(props: ComposerTabsProps) {
  const days = Object.entries(groupBy(props.tabs, (tab) => tab.dayLabel));
  const navRef = useRef<HTMLElement>(null);
  const selectedRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    const selected = selectedRef.current;
    if (nav === null || selected === null) return;
    nav.scrollTop =
      selected.offsetTop - nav.clientHeight / 2 + selected.clientHeight / 2;
  }, [props.selectedPostId]);
  return (
    <nav
      ref={navRef}
      aria-label="Posts in this campaign"
      className="bg-card relative flex max-h-[calc(100dvh-88px)] min-w-0 flex-col overflow-y-auto border lg:sticky lg:top-3"
    >
      <div className="text-muted-foreground bg-card sticky top-0 z-20 flex h-8 shrink-0 items-center justify-between border-b px-3 text-[10.5px] font-semibold tracking-[0.06em] uppercase">
        <span>Posts</span>
        <span className="tabular-nums">{props.tabs.length}</span>
      </div>
      {days.map(([day, tabs]) => (
        <div key={day} className="flex flex-col">
          <div className="text-muted-foreground bg-cc-panel-2 sticky top-8 z-10 border-b px-3 py-1 text-[10px] tracking-[0.06em]">
            {day}
          </div>
          {tabs.map((tab) => {
            const isSelected = tab.postId === props.selectedPostId;
            return (
              <Link
                key={tab.postId}
                ref={isSelected ? selectedRef : undefined}
                href={`/composer?post=${tab.postId}`}
                aria-current={isSelected ? "page" : undefined}
                className={cn(
                  "border-cc-line-soft flex flex-col gap-y-0.5 border-b border-l-2 px-2.5 py-1.5",
                  isSelected
                    ? "border-l-primary bg-primary/10"
                    : "hover:bg-cc-panel-2 border-l-transparent"
                )}
              >
                <span className="flex items-center justify-between gap-x-1.5">
                  <span className="flex items-center gap-x-1.5">
                    <span className="text-[11px] font-semibold tabular-nums">
                      {tab.timeLabel}
                    </span>
                    <PlatformChip platformId={tab.platformId} />
                  </span>
                  <StatusDot tone={tab.tone} label={tab.statusLabel} />
                </span>
                <span
                  className={cn(
                    "truncate text-[11px]",
                    isSelected ? "text-foreground" : "text-cc-text-2"
                  )}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
