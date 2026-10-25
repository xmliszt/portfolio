import type { ThemeSchedule } from "./theme-schedule";

function isAnnualDate(options: { month: unknown; day: unknown }) {
  const { month, day } = options;
  if (typeof month !== "number" || typeof day !== "number") return false;
  if (!Number.isInteger(month) || !Number.isInteger(day)) return false;
  const date = new Date(Date.UTC(2001, month - 1, day));
  return date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
}

export function parseThemeSchedule(value: unknown): ThemeSchedule | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  if (
    !("id" in value) ||
    typeof value.id !== "string" ||
    !("themeId" in value) ||
    typeof value.themeId !== "string" ||
    !("startMonth" in value) ||
    typeof value.startMonth !== "number" ||
    !("startDay" in value) ||
    typeof value.startDay !== "number" ||
    !("endMonth" in value) ||
    typeof value.endMonth !== "number" ||
    !("endDay" in value) ||
    typeof value.endDay !== "number" ||
    !("timeZone" in value) ||
    typeof value.timeZone !== "string" ||
    !("priority" in value) ||
    typeof value.priority !== "number" ||
    !Number.isInteger(value.priority) ||
    !isAnnualDate({ month: value.startMonth, day: value.startDay }) ||
    !isAnnualDate({ month: value.endMonth, day: value.endDay }) ||
    (value.startMonth === value.endMonth && value.startDay === value.endDay)
  )
    return undefined;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value.timeZone });
  } catch {
    return undefined;
  }
  return {
    id: value.id,
    themeId: value.themeId,
    startMonth: value.startMonth,
    startDay: value.startDay,
    endMonth: value.endMonth,
    endDay: value.endDay,
    timeZone: value.timeZone,
    priority: value.priority,
  };
}
