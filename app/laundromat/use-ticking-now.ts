import { useEffect, useState } from "react";

const TICK_MS = 1000;

/** Return the current time in ms, updated every second while `active`. */
export function useTickingNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(interval);
  }, [active]);

  return now;
}
