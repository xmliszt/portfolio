"use client";

import { useLayoutEffect, useMemo, useState } from "react";

import { LaundromatEntry } from "@/app/laundromat/laundromat-entry";
import { bedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { applySceneTheme } from "@/lib/laundromat/themes/apply-scene-theme";
import { parseThemeId } from "@/lib/laundromat/themes/parse-theme-id";
import { parseThemePreference } from "@/lib/laundromat/themes/parse-theme-preference";
import { resolveThemeSchedule } from "@/lib/laundromat/themes/resolve-theme-schedule";
import type { ThemePreference } from "@/lib/laundromat/themes/themes";
import { themes } from "@/lib/laundromat/themes/themes";

import { SceneThemeContext } from "./scene-theme-context";
import { SceneThemeStyle } from "./scene-theme-style";
import { useThemeSchedules } from "./use-theme-schedules";

const STORAGE_KEY = "laundromat:theme";

export function ThemedLaundromat() {
  const [preference, setPreferenceState] = useState<ThemePreference>({
    kind: "automatic",
  });
  const snapshot = useThemeSchedules();
  const automaticThemeId =
    parseThemeId(
      resolveThemeSchedule({
        ...snapshot,
        availableThemeIds: Object.keys(themes),
      }).themeId
    ) ?? "classic";
  const themeId =
    preference.kind === "manual" ? preference.themeId : automaticThemeId;
  const config = useMemo(
    () =>
      applySceneTheme({
        scene: sceneConfig,
        bedroom: bedroomConfig,
        theme: themes[themeId],
      }),
    [themeId]
  );

  useLayoutEffect(() => {
    function readPreference() {
      try {
        setPreferenceState(
          parseThemePreference(window.localStorage.getItem(STORAGE_KEY))
        );
      } catch {
        setPreferenceState({ kind: "automatic" });
      }
    }
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY || event.key === null) readPreference();
    }
    readPreference();
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    try {
      if (next.kind === "automatic")
        window.localStorage.removeItem(STORAGE_KEY);
      else window.localStorage.setItem(STORAGE_KEY, next.themeId);
    } catch {
      return;
    }
  }

  return (
    <SceneThemeContext.Provider
      value={{
        kind: "visitor",
        tokens: config.scene.tokens,
        preference,
        themeId,
        setPreference,
      }}
    >
      <SceneThemeStyle config={config.scene} themeId={themeId} />
      <LaundromatEntry config={config.scene} bedroom={config.bedroom} />
    </SceneThemeContext.Provider>
  );
}
