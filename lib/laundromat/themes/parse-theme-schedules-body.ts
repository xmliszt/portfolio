import { parseThemeSchedule } from "./parse-theme-schedule";

export function parseThemeSchedulesBody(value: unknown) {
  if (
    typeof value !== "object" ||
    value === null ||
    !("nowMs" in value) ||
    typeof value.nowMs !== "number" ||
    !Number.isFinite(value.nowMs) ||
    Math.abs(value.nowMs) > 8.64e15 ||
    !("schedules" in value) ||
    !Array.isArray(value.schedules)
  )
    return undefined;
  return {
    nowMs: value.nowMs,
    schedules: value.schedules.flatMap((row: unknown) => {
      const schedule = parseThemeSchedule(row);
      return schedule === undefined ? [] : [schedule];
    }),
  };
}
