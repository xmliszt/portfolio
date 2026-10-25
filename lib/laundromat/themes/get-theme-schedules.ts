import "server-only";

import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";

import { parseThemeSchedule } from "./parse-theme-schedule";
import type { ThemeSchedule } from "./theme-schedule";

export async function getThemeSchedules(): Promise<ThemeSchedule[]> {
  const client = createLaundromatServiceClient();
  if (client === undefined) return [];
  try {
    const { data, error } = await client
      .from("theme_schedules")
      .select(
        "id, theme_id, start_month, start_day, end_month, end_day, time_zone, priority"
      )
      .eq("enabled", true)
      .abortSignal(AbortSignal.timeout(3_000));
    if (error !== null || data === null) return [];
    return data.flatMap((row) => {
      const schedule = parseThemeSchedule({
        id: row.id,
        themeId: row.theme_id,
        startMonth: row.start_month,
        startDay: row.start_day,
        endMonth: row.end_month,
        endDay: row.end_day,
        timeZone: row.time_zone,
        priority: row.priority,
      });
      return schedule === undefined ? [] : [schedule];
    });
  } catch {
    return [];
  }
}
