const SGT_OFFSET_HOURS = 8;

/** Return the instant of a Singapore-time `date` ("yyyy-MM-dd") and `time` ("HH:mm"). */
export function sgtToUtc(options: { date: string; time: string }) {
  const [year, month, day] = options.date.split("-").map(Number);
  const [hour, minute] = options.time.split(":").map(Number);
  return new Date(
    Date.UTC(year, month - 1, day, hour - SGT_OFFSET_HOURS, minute)
  );
}
