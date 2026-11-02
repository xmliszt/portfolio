"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

type ChecksTab = { id: string; label: string; content: React.ReactNode };

type ChecksColumnProps = {
  tabs: readonly ChecksTab[];
};

export function ChecksColumn(props: ChecksColumnProps) {
  const [selectedId, setSelectedId] = useState(props.tabs.at(0)?.id);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const index = props.tabs.findIndex((tab) => tab.id === selectedId);
    const nextIndex = (() => {
      switch (event.key) {
        case "ArrowRight":
          return (index + 1) % props.tabs.length;
        case "ArrowLeft":
          return (index - 1 + props.tabs.length) % props.tabs.length;
        case "Home":
          return 0;
        case "End":
          return props.tabs.length - 1;
        default:
          return undefined;
      }
    })();
    const next = nextIndex === undefined ? undefined : props.tabs.at(nextIndex);
    if (next === undefined) return;
    event.preventDefault();
    setSelectedId(next.id);
    document.getElementById(`checks-tab-${next.id}`)?.focus();
  }
  return (
    <div className="flex min-w-0 flex-col gap-y-2">
      <div
        role="tablist"
        aria-label="Checks"
        onKeyDown={handleKeyDown}
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
              tabIndex={isSelected ? 0 : -1}
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
          tabIndex={0}
          className="min-w-0"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
