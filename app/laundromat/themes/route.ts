import { getThemeSchedules } from "@/lib/laundromat/themes/get-theme-schedules";
import { resolveThemeSchedule } from "@/lib/laundromat/themes/resolve-theme-schedule";
import { themes } from "@/lib/laundromat/themes/themes";

export const dynamic = "force-dynamic";

export async function GET() {
  const schedules = await getThemeSchedules();
  const nowMs = Date.now();
  return Response.json(
    {
      schedules,
      nowMs,
      ...resolveThemeSchedule({
        schedules,
        nowMs,
        availableThemeIds: Object.keys(themes),
      }),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
