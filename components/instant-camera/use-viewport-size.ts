"use client";

import { useEffect, useState } from "react";

import type { ViewportSize } from "@/lib/laundromat/instant-camera/viewfinder-frame";

/** Return the window's inner size, kept current on resize, or `undefined` before the first effect runs. */
export function useViewportSize() {
  const [size, setSize] = useState<ViewportSize>();
  useEffect(() => {
    function measure() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return size;
}
