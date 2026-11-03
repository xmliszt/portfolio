import { getSgtParts } from "@/lib/cc/get-sgt-parts";

import type { CcTheme, CcThemePreference } from "./cc-theme";

const LIGHT_FROM_HOUR = 7;
const DARK_FROM_HOUR = 19;

/** Return the theme to show at `now`: the fixed choice, or for `"auto"` light from 07:00 to 19:00 SGT and dark otherwise. */
export function resolveTheme(options: {
  preference: CcThemePreference;
  now: Date;
}): CcTheme {
  if (options.preference !== "auto") return options.preference;
  const hour = getSgtParts(options.now).hour;
  return hour >= LIGHT_FROM_HOUR && hour < DARK_FROM_HOUR ? "light" : "dark";
}
