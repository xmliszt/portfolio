"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

import type { ComposerTab } from "./composer-tab";

type ComposerTabsProps = {
  tabs: readonly ComposerTab[];
  selectedPostId: string;
};

export function ComposerTabs(props: ComposerTabsProps) {
  return (
    <nav
      aria-label="Posts by platform"
      className="flex flex-wrap gap-x-1.5 gap-y-1.5"
    >
      {props.tabs.map((tab) => {
        const isSelected = tab.postId === props.selectedPostId;
        return (
          <Link
            key={tab.postId}
            href={`/composer?post=${tab.postId}`}
            aria-current={isSelected ? "page" : undefined}
            className={cn(
              "flex min-h-11 items-center gap-x-2 border px-3.5 text-[12px]",
              isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span>{tab.label}</span>
            {tab.detail !== undefined && (
              <span className="text-[11px] opacity-80">{tab.detail}</span>
            )}
            {tab.isPosted && <span className="text-cc-ok">✓</span>}
          </Link>
        );
      })}
    </nav>
  );
}
