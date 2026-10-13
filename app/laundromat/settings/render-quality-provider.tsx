"use client";

import { useEffect, useState } from "react";

import { detectRenderQuality } from "@/lib/laundromat/render-quality/detect-render-quality";
import type {
  RenderQuality,
  RenderQualityPreference,
} from "@/lib/laundromat/render-quality/render-quality";
import { RENDER_QUALITY_PREFERENCES } from "@/lib/laundromat/render-quality/render-quality";

import { RenderQualityContext } from "./render-quality-context";

const RENDER_QUALITY_STORAGE_KEY = "laundromat:render-quality";

type RenderQualityProviderProps = {
  children: React.ReactNode;
};

function readStoredPreference() {
  try {
    const stored = window.localStorage.getItem(RENDER_QUALITY_STORAGE_KEY);
    return (
      RENDER_QUALITY_PREFERENCES.find((preference) => preference === stored) ??
      "auto"
    );
  } catch {
    return "auto";
  }
}

function detectDeviceQuality() {
  return detectRenderQuality({
    deviceMemoryGb:
      "deviceMemory" in navigator && typeof navigator.deviceMemory === "number"
        ? navigator.deviceMemory
        : undefined,
    cpuCores: navigator.hardwareConcurrency || undefined,
  });
}

/** Provide the laundromat's rendering quality: the visitor's remembered preference, or the quality detected for this device when it is `auto`; `full` until mounted. */
export function RenderQualityProvider(props: RenderQualityProviderProps) {
  const [detected, setDetected] = useState<RenderQuality>("full");
  const [preference, setPreferenceState] =
    useState<RenderQualityPreference>("auto");

  useEffect(() => {
    setDetected(detectDeviceQuality());
    setPreferenceState(readStoredPreference());
  }, []);

  function setPreference(next: RenderQualityPreference) {
    setPreferenceState(next);
    try {
      window.localStorage.setItem(RENDER_QUALITY_STORAGE_KEY, next);
    } catch {
      return;
    }
  }

  return (
    <RenderQualityContext.Provider
      value={{
        quality: preference === "auto" ? detected : preference,
        detected,
        preference,
        setPreference,
      }}
    >
      {props.children}
    </RenderQualityContext.Provider>
  );
}
