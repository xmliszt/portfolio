import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LaundromatHome } from "@/app/laundromat/laundromat-home";
import { getLaundromatLocaleMetadata } from "@/lib/laundromat/i18n/get-laundromat-locale-metadata";
import { LAUNDROMAT_LOCALES } from "@/lib/laundromat/i18n/laundromat-locales";
import { parseLaundromatLocale } from "@/lib/laundromat/i18n/parse-laundromat-locale";

export const dynamicParams = false;

export function generateStaticParams() {
  return LAUNDROMAT_LOCALES.map((locale) => ({ locale }));
}

type LocalizedLaundromatPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(
  props: LocalizedLaundromatPageProps
): Promise<Metadata> {
  const locale = parseLaundromatLocale((await props.params).locale);
  return locale === undefined ? {} : getLaundromatLocaleMetadata(locale);
}

export default async function LocalizedLaundromatPage(
  props: LocalizedLaundromatPageProps
) {
  const locale = parseLaundromatLocale((await props.params).locale);
  if (locale === undefined) notFound();
  return <LaundromatHome locale={locale} />;
}
