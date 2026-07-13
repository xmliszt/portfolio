import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  AboutView,
  buildAboutMetadata,
} from "@/app/apps/[app_id]/about/about-view";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n";

import { abouts } from "#site/content";

type Props = {
  params: Promise<{
    app_id: string;
    locale: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const locale = SUPPORTED_LOCALES.find((l) => l === params.locale);

  if (locale == null || locale === DEFAULT_LOCALE) return {};

  return buildAboutMetadata({ appId: params.app_id, locale });
}

export async function generateStaticParams() {
  return abouts
    .filter((about) => about.locale !== DEFAULT_LOCALE)
    .map((about) => ({ app_id: about.appId, locale: about.locale }));
}

export default async function LocalizedAboutPage(props: Props) {
  const params = await props.params;
  const locale = SUPPORTED_LOCALES.find((l) => l === params.locale);

  if (locale == null) notFound();
  if (locale === DEFAULT_LOCALE) redirect(`/apps/${params.app_id}/about`);

  return <AboutView appId={params.app_id} locale={locale} />;
}
