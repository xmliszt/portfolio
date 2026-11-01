import { PLATFORM_IDS, type PlatformId } from "./platforms";

/** `true` if `value` is one of `PLATFORM_IDS`; `false` otherwise. */
export function isPlatformId(value: string): value is PlatformId {
  return PLATFORM_IDS.some((id) => id === value);
}
