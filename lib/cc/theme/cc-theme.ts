export const CC_THEME_COOKIE = "cc-theme";

export const CC_THEME_PREFERENCES = ["auto", "light", "dark"] as const;

export type CcThemePreference = (typeof CC_THEME_PREFERENCES)[number];

export type CcTheme = "light" | "dark";
