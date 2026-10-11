import { DEFAULT_LAUNDROMAT_LOCALE } from "./laundromat-locales";
import { parseLaundromatLocale } from "./parse-laundromat-locale";

/** Return the locale to serve: the `cookieLocale` the visitor picked when it is supported, else the highest-weighted supported language in the `acceptLanguage` header, else English. */
export function resolveLaundromatLocale(options: {
  cookieLocale: string | undefined;
  acceptLanguage: string | undefined;
}) {
  const picked =
    options.cookieLocale === undefined
      ? undefined
      : parseLaundromatLocale(options.cookieLocale);
  if (picked !== undefined) return picked;
  const requested = (options.acceptLanguage ?? "")
    .split(",")
    .map((entry, index) => {
      const [tag = "", ...params] = entry.split(";");
      const quality = params
        .map((param) => param.trim())
        .find((param) => param.startsWith("q="));
      return {
        tag: tag.trim(),
        weight: quality === undefined ? 1 : Number(quality.slice(2)) || 0,
        index,
      };
    })
    .filter(({ tag, weight }) => tag !== "" && tag !== "*" && weight > 0)
    .toSorted((a, b) => b.weight - a.weight || a.index - b.index);
  for (const { tag } of requested) {
    const locale = parseLaundromatLocale(tag);
    if (locale !== undefined) return locale;
  }
  return DEFAULT_LAUNDROMAT_LOCALE;
}
