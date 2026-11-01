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
    <div className="flex items-stretch gap-x-3 gap-y-3">
      <div className="bg-card flex flex-col gap-y-0.5 border px-4 py-2.5">
        <span className="text-muted-foreground text-[11px] tracking-[0.14em]">
          SGT
        </span>
        <span
          suppressHydrationWarning
          className="text-[22px] font-bold tabular-nums"
        >
          {formatSgt({ date: now, pattern: "HH:mm:ss" })}
        </span>
      </div>
      <div className="border-primary bg-primary/[0.07] flex flex-col gap-y-0.5 border px-4 py-2.5 shadow-[0_0_24px_hsl(var(--primary)/0.18)]">
        <span className="text-primary text-[11px] tracking-[0.14em]">
          {next === undefined ? "NEXT" : `NEXT · ${next.label}`}
        </span>
        <span
          suppressHydrationWarning
          className="text-primary text-[22px] font-bold tabular-nums"
        >
          {next === undefined
            ? "Nothing scheduled"
            : formatCountdown(new Date(next.atIso).getTime() - now.getTime())}
        </span>
      </div>
    </div>
  );
}
