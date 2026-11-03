import { CC_THEME_PREFERENCES, type CcThemePreference } from "./cc-theme";

/** Return the theme preference stored in the cookie `value`, or `"auto"` when it is missing or unknown. */
export function parseThemePreference(value: string | undefined) {
  return (CC_THEME_PREFERENCES.find((preference) => preference === value) ??
    "auto") satisfies CcThemePreference;
}
