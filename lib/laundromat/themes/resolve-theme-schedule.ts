import type { ThemeSchedule } from "./theme-schedule";

function getCalendarDate(options: {
  nowMs: number;
  formatter: Intl.DateTimeFormat;
}) {
  const parts = options.formatter.formatToParts(options.nowMs);
  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getBoundaryMs(options: {
  year: number;
  month: number;
  day: number;
  formatter: Intl.DateTimeFormat;
}) {
  const target = options.year * 10_000 + options.month * 100 + options.day;
  const approximateMs = Date.UTC(options.year, options.month - 1, options.day);
  let beforeMs = approximateMs - 36 * 60 * 60_000;
  let afterMs = approximateMs + 36 * 60 * 60_000;
  while (afterMs - beforeMs > 1) {
    const middleMs = Math.floor((beforeMs + afterMs) / 2);
    const date = getCalendarDate({
      nowMs: middleMs,
      formatter: options.formatter,
    });
    const calendarDate = date.year * 10_000 + date.month * 100 + date.day;
    if (calendarDate < target) beforeMs = middleMs;
    else afterMs = middleMs;
  }
  return afterMs;
}

export function resolveThemeSchedule(options: {
  schedules: ThemeSchedule[];
  nowMs: number;
  availableThemeIds: string[];
}) {
  const schedules = options.schedules
    .filter((schedule) => options.availableThemeIds.includes(schedule.themeId))
    .toSorted(
      (a, b) =>
        b.priority - a.priority || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    );
  const periods = schedules.map((schedule) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: schedule.timeZone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    const date = getCalendarDate({
      nowMs: options.nowMs,
      formatter,
    });
    const today = date.month * 100 + date.day;
    const start = schedule.startMonth * 100 + schedule.startDay;
    const end = schedule.endMonth * 100 + schedule.endDay;
    const active =
      start < end
        ? today >= start && today < end
        : today >= start || today < end;
    const boundaries = [
      { month: schedule.startMonth, day: schedule.startDay },
      { month: schedule.endMonth, day: schedule.endDay },
    ].map((boundary) => {
      const atMs = getBoundaryMs({ ...boundary, year: date.year, formatter });
      return atMs > options.nowMs
        ? atMs
        : getBoundaryMs({ ...boundary, year: date.year + 1, formatter });
    });
    return { schedule, active, boundaries };
  });
  const nextChangeAtMs = periods
    .flatMap((period) => period.boundaries)
    .toSorted((a, b) => a - b)
    .at(0);
  return {
    themeId:
      periods.find((period) => period.active)?.schedule.themeId ?? "classic",
    nextChangeAtMs,
  };
}
