import type { ThemeId } from "./themes";
import { themes } from "./themes";

export function parseThemeId(value: unknown): ThemeId | undefined {
  return Object.keys(themes).find((id): id is ThemeId => id === value);
}
