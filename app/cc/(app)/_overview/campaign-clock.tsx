"use client";

import { useEffect, useState } from "react";

import { formatSgt } from "@/lib/cc/format-sgt";

type CampaignClockProps = {
  upcoming: { atIso: string; label: string }[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function formatCountdown(remainingMs: number) {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86_400);
  const clock = `${pad(Math.floor((totalSeconds % 86_400) / 3600))}:${pad(Math.floor((totalSeconds % 3600) / 60))}:${pad(totalSeconds % 60)}`;
  return days > 0 ? `T−${days}d ${clock}` : `T−${clock}`;
}

export function CampaignClock(props: CampaignClockProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const next = props.upcoming.find(
    (item) => new Date(item.atIso).getTime() > now.getTime()
  );

  return (
    <div className="flex items-center gap-x-3 text-[11px] tabular-nums">
      <span className="text-muted-foreground">
        SGT{" "}
        <span
          suppressHydrationWarning
          className="text-foreground font-semibold"
        >
          {formatSgt({ date: now, pattern: "HH:mm:ss" })}
        </span>
      </span>
      <span className="bg-primary/10 text-primary border-primary/40 flex h-7 items-center gap-x-2 border px-2.5">
        <span className="text-[10.5px] tracking-[0.04em] uppercase">
          {next === undefined ? "Next" : `Next · ${next.label}`}
        </span>
        <span suppressHydrationWarning className="font-semibold">
          {next === undefined
            ? "nothing scheduled"
            : formatCountdown(new Date(next.atIso).getTime() - now.getTime())}
        </span>
      </span>
    </div>
  );
}
