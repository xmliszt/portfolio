import { getBoardEntries } from "./board/get-board-entries";
import { getLaundromatCopy } from "./i18n/get-laundromat-copy";
import { parseLaundromatLocale } from "./i18n/parse-laundromat-locale";

/** Return the version response body: `buildId`, plus `updates` with every board entry in the locale `localeTag` asks for, left out when `localeTag` is `undefined` or names no supported locale. */
export function getVersionBody(options: {
  buildId: string | undefined;
  localeTag: string | undefined;
}) {
  const locale =
    options.localeTag === undefined
      ? undefined
      : parseLaundromatLocale(options.localeTag);
  return locale === undefined
    ? { buildId: options.buildId }
    : {
        buildId: options.buildId,
        updates: getBoardEntries({ copy: getLaundromatCopy(locale) }),
      };
}
