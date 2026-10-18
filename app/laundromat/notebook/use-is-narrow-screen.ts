"use client";

import { useEffect, useState } from "react";

const NARROW_SCREEN_QUERY = "(max-width: 719px)";

/** Return `true` while the screen is narrower than 720px; `false` otherwise. */
export function useIsNarrowScreen() {
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(NARROW_SCREEN_QUERY);
    setIsNarrow(query.matches);
    function handleChange(event: MediaQueryListEvent) {
      setIsNarrow(event.matches);
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return isNarrow;
}
