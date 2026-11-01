"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

/** `true` if a click on `event.target` follows an in-app link to a different URL; `false` for new tabs, downloads, other origins and the current URL. */
function isInternalNavigation(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }
  const anchor =
    event.target instanceof Element ? event.target.closest("a") : null;
  if (
    anchor === null ||
    anchor.target === "_blank" ||
    anchor.hasAttribute("download")
  ) {
    return false;
  }
  const url = new URL(anchor.href, window.location.href);
  return (
    url.origin === window.location.origin &&
    url.pathname + url.search !==
      window.location.pathname + window.location.search
  );
}

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
