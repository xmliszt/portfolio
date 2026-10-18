"use client";

import { useEffect, useState } from "react";

/** Return the wiggle frame, stepping through `0` to `frameCount - 1` at `fps` while `isEnabled`, or `undefined` while it is not. */
export function useWiggleFrame(options: {
  isEnabled: boolean;
  fps: number;
  frameCount: number;
}) {
  const [frame, setFrame] = useState(0);
  const { isEnabled, fps, frameCount } = options;

  useEffect(() => {
    if (!isEnabled) return;
    const interval = window.setInterval(
      () => setFrame((current) => (current + 1) % frameCount),
      1000 / fps
    );
    return () => window.clearInterval(interval);
  }, [isEnabled, fps, frameCount]);

  return isEnabled ? frame : undefined;
}
