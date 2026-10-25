import { parseThemeId } from "./parse-theme-id";
import type { ThemePreference } from "./themes";

export function parseThemePreference(value: unknown): ThemePreference {
  const themeId = parseThemeId(value);
  return themeId === undefined
    ? { kind: "automatic" }
    : { kind: "manual", themeId };
}
