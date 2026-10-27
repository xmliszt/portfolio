type DeviceHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/** Return `"lite"` when the browser asks to save data or reports at most 4 CPU cores or 4 GB of memory; `"full"` otherwise, including when it reports neither. */
export function resolveSunsetQuality() {
  const hints: DeviceHints = navigator;
  if (hints.connection?.saveData) return "lite";
  if (hints.hardwareConcurrency !== undefined && hints.hardwareConcurrency <= 4)
    return "lite";
  if (hints.deviceMemory !== undefined && hints.deviceMemory <= 4)
    return "lite";
  return "full";
}
