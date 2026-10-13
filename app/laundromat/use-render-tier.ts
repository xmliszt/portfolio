import { useSyncExternalStore } from "react";

const LITE_MAX_CORES = 4;
const LITE_MAX_MEMORY_GB = 4;

export type RenderTier = "full" | "lite";

function subscribe() {
  return () => {};
}

function getTier(): RenderTier {
  const cores = navigator.hardwareConcurrency ?? Infinity;
  const memoryGb =
    "deviceMemory" in navigator && typeof navigator.deviceMemory === "number"
      ? navigator.deviceMemory
      : Infinity;
  return cores <= LITE_MAX_CORES || memoryGb <= LITE_MAX_MEMORY_GB
    ? "lite"
    : "full";
}

/** Return `"lite"` when `navigator.hardwareConcurrency <= LITE_MAX_CORES` or `navigator.deviceMemory <= LITE_MAX_MEMORY_GB`, `"full"` otherwise, and `"lite"` during server rendering. */
export function useRenderTier() {
  return useSyncExternalStore(subscribe, getTier, (): RenderTier => "lite");
}
