import { useEffect, useState } from "react";

const TICK_MS = 1000;

/** Return the current time in ms, updated every `intervalMs` (a second by default) while `active`. */
export function useTickingNow(options: {
  active: boolean;
  intervalMs?: number;
}) {
  const { active } = options;
  const intervalMs = options.intervalMs ?? TICK_MS;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const interval = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(interval);
  }, [active, intervalMs]);

  return now;
}
