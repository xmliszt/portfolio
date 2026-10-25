"use client";

import { useEffect, useState } from "react";

import { LAUNDROMAT_BASE_PATH } from "@/lib/laundromat/hosts";
import { parseThemeSchedulesBody } from "@/lib/laundromat/themes/parse-theme-schedules-body";
import { resolveThemeSchedule } from "@/lib/laundromat/themes/resolve-theme-schedule";
import type { ThemeSchedule } from "@/lib/laundromat/themes/theme-schedule";
import { themes } from "@/lib/laundromat/themes/themes";

const REFRESH_MS = 60_000;
const REQUEST_TIMEOUT_MS = 5_000;

export function useThemeSchedules() {
  const [snapshot, setSnapshot] = useState<{
    schedules: ThemeSchedule[];
    nowMs: number;
  }>({ schedules: [], nowMs: 0 });

  useEffect(() => {
    let schedules: ThemeSchedule[] = [];
    let clockOffsetMs = 0;
    let timer: number | undefined;
    let request: AbortController | undefined;

    async function refresh() {
      window.clearTimeout(timer);
      request?.abort();
      request = undefined;
      if (document.visibilityState !== "visible") return;
      const controller = new AbortController();
      request = controller;
      const requestTimeout = window.setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS
      );
      setSnapshot({ schedules, nowMs: Date.now() + clockOffsetMs });
      try {
        const response = await fetch(`${LAUNDROMAT_BASE_PATH}/themes`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const body = response.ok
          ? parseThemeSchedulesBody(await response.json())
          : undefined;
        if (request !== controller) return;
        schedules = body?.schedules ?? [];
        clockOffsetMs = body === undefined ? 0 : body.nowMs - Date.now();
      } catch {
        if (request !== controller) return;
        schedules = [];
        clockOffsetMs = 0;
      } finally {
        window.clearTimeout(requestTimeout);
      }
      const nowMs = Date.now() + clockOffsetMs;
      setSnapshot({ schedules, nowMs });
      const { nextChangeAtMs } = resolveThemeSchedule({
        schedules,
        nowMs,
        availableThemeIds: Object.keys(themes),
      });
      const delayMs =
        nextChangeAtMs === undefined
          ? REFRESH_MS
          : Math.min(REFRESH_MS, Math.max(1, nextChangeAtMs - nowMs));
      timer = window.setTimeout(refresh, delayMs);
    }

    void refresh();
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      request?.abort();
      request = undefined;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return snapshot;
}
