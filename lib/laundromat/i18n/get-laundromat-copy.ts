import { de } from "./copy/de";
import { en } from "./copy/en";
import { es } from "./copy/es";
import { fr } from "./copy/fr";
import { hi } from "./copy/hi";
import { id } from "./copy/id";
import { it } from "./copy/it";
import { ja } from "./copy/ja";
import { ko } from "./copy/ko";
import { nl } from "./copy/nl";
import { pl } from "./copy/pl";
import { ptBR } from "./copy/pt-br";
import { ru } from "./copy/ru";
import { tr } from "./copy/tr";
import { uk } from "./copy/uk";
import { vi } from "./copy/vi";
import { zhHans } from "./copy/zh-hans";
import { zhHant } from "./copy/zh-hant";
import type { LaundromatCopy } from "./laundromat-copy";
import type { LaundromatLocale } from "./laundromat-locales";

const COPIES = {
  en,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  ja,
  ko,
  fr,
  de,
  es,
  "pt-BR": ptBR,
  it,
  nl,
  tr,
  ru,
  uk,
  pl,
  id,
  vi,
  hi,
} satisfies { [locale in LaundromatLocale]: LaundromatCopy };

/** Return the laundromat's copy in `locale`. */
export function getLaundromatCopy(locale: LaundromatLocale): LaundromatCopy {
  return COPIES[locale];
}
