const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

type PlannedReminder = {
  kind: "post" | "reply" | "log";
  checkpoint: "1h" | "24h" | "7d" | null;
  fireAt: Date;
};

/** Return the reminders a post gets: post at −10 min from `scheduledAt`, then reply at +30 min and logs at +1 h, +24 h and +7 d from `postedAt` (or `scheduledAt` before it is posted). */
export function planPostReminders(options: {
  scheduledAt: Date;
  postedAt: Date | undefined;
}): PlannedReminder[] {
  const start = options.postedAt ?? options.scheduledAt;
  const at = (offsetMs: number) => new Date(start.getTime() + offsetMs);
  return [
    ...(options.postedAt === undefined
      ? [
          {
            kind: "post",
            checkpoint: null,
            fireAt: new Date(options.scheduledAt.getTime() - 10 * MINUTE_MS),
          } satisfies PlannedReminder,
        ]
      : []),
    { kind: "reply", checkpoint: null, fireAt: at(30 * MINUTE_MS) },
    { kind: "log", checkpoint: "1h", fireAt: at(HOUR_MS) },
    { kind: "log", checkpoint: "24h", fireAt: at(24 * HOUR_MS) },
    { kind: "log", checkpoint: "7d", fireAt: at(7 * 24 * HOUR_MS) },
  ];
}
