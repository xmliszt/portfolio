"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type PopoverMenuProps = {
  label: string;
  align?: "start" | "end";
  widthClassName?: string;
  children: React.ReactNode;
};

export function PopoverMenu(props: PopoverMenuProps) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current;
      if (
        details?.open &&
        event.target instanceof Node &&
        !details.contains(event.target)
      ) {
        details.open = false;
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      const details = detailsRef.current;
      if (event.key === "Escape" && details?.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <details ref={detailsRef} className="group relative">
      <summary
        className={cn(
          "inline-flex h-7 list-none items-center gap-x-1.5 border px-2.5 text-[11px] font-semibold tracking-[0.04em] whitespace-nowrap select-none [&::-webkit-details-marker]:hidden",
          "focus-visible:outline-primary focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-1",
          "text-cc-text-2 hover:border-primary hover:text-foreground group-open:border-primary group-open:text-foreground"
        )}
      >
        {props.label}
        <span aria-hidden className="text-[9px] group-open:rotate-180">
          ▾
        </span>
      </summary>
      <div
        className={cn(
          "bg-popover absolute bottom-[calc(100%+4px)] z-30 flex flex-col gap-y-2 border p-3 shadow-[0_8px_24px_hsl(var(--cc-shadow))]",
          props.align === "end" ? "right-0" : "left-0",
          props.widthClassName ?? "w-[300px]"
        )}
      >
        {props.children}
      </div>
    </details>
  );
}
