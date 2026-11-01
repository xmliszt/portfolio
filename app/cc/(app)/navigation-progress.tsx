"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

import { isInternalNavigation } from "./is-internal-navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (isInternalNavigation(event)) setIsNavigating(true);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[110] transition-opacity duration-150",
        isNavigating ? "opacity-100" : "opacity-0"
      )}
    >
      <div className="bg-primary/20 h-0.5 overflow-hidden">
        <div className="bg-primary animate-cc-progress h-full w-1/3 shadow-[0_0_12px_hsl(var(--primary))]" />
      </div>
      {isNavigating && <span className="sr-only">Loading</span>}
    </div>
  );
}
