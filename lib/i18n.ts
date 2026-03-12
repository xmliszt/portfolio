import fs from "fs";
import path from "path";

export const SUPPORTED_LOCALES = ["en", "zh-Hans"] as const;
export const DEFAULT_LOCALE = "en";

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Resolves the effective locale from a requested locale string.
 * Falls back to DEFAULT_LOCALE if the requested locale is not supported.
 */
export function resolveLocale(
  requestedLocale: string | null | undefined
): Locale {
  if (!requestedLocale) {
    return DEFAULT_LOCALE;
  }

  // Normalize locale string (handle case variations)
  const normalizedLocale = requestedLocale.trim();

  // Check exact match first
  if (SUPPORTED_LOCALES.includes(normalizedLocale as Locale)) {
    return normalizedLocale as Locale;
  }

  // Fallback to default
  return DEFAULT_LOCALE;
}

/**
 * Gets the localized content directory path for a given app and locale.
 */
export function getLocalizedContentPath(appId: string, locale: Locale): string {
  const basePath = path.join(process.cwd(), "content", "apps", appId);

  // Check if localized directory exists
  const localizedPath = path.join(basePath, locale);
  if (fs.existsSync(localizedPath)) {
    return localizedPath;
  }

  // Fallback to default locale
  return basePath;
}
