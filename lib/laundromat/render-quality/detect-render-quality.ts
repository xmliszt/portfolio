import type { RenderQuality } from "./render-quality";

const LITE_MAX_DEVICE_MEMORY_GB = 4;
const LITE_MAX_CPU_CORES = 4;

/** Return `lite` when the device reports at most 4 GB of memory or at most 4 CPU cores, and `full` otherwise or when it reports neither. */
export function detectRenderQuality(options: {
  deviceMemoryGb: number | undefined;
  cpuCores: number | undefined;
}): RenderQuality {
  const isLowMemory =
    options.deviceMemoryGb !== undefined &&
    options.deviceMemoryGb <= LITE_MAX_DEVICE_MEMORY_GB;
  const isFewCores =
    options.cpuCores !== undefined && options.cpuCores <= LITE_MAX_CPU_CORES;
  return isLowMemory || isFewCores ? "lite" : "full";
}
