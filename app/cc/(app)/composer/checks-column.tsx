"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ChecksTab = { id: string; label: string; content: React.ReactNode };

type ChecksColumnProps = {
  tabs: readonly ChecksTab[];
};

export function ChecksColumn(props: ChecksColumnProps) {
  const [selectedId, setSelectedId] = useState(props.tabs.at(0)?.id);
  return (
    <div className="flex min-w-0 flex-col gap-y-2 lg:sticky lg:top-3">
      <div
        role="tablist"
        aria-label="Checks"
        className="bg-card flex flex-wrap border"
      >
        {props.tabs.map((tab) => {
          const isSelected = tab.id === selectedId;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`checks-tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`checks-panel-${tab.id}`}
              onClick={() => setSelectedId(tab.id)}
              className={cn(
                "h-7 flex-1 border-b-2 px-2 text-[10.5px] font-semibold tracking-[0.04em] whitespace-nowrap uppercase",
                isSelected
                  ? "border-b-primary text-foreground"
                  : "text-muted-foreground hover:text-foreground border-b-transparent"
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      {props.tabs.map((tab) => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`checks-panel-${tab.id}`}
          aria-labelledby={`checks-tab-${tab.id}`}
          hidden={tab.id !== selectedId}
          className="min-w-0"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
