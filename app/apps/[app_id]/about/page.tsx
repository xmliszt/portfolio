import type { Metadata } from "next";

import {
  AboutView,
  buildAboutMetadata,
} from "@/app/apps/[app_id]/about/about-view";
import { DEFAULT_LOCALE } from "@/lib/i18n";

import { abouts } from "#site/content";

type Props = {
  params: Promise<{
    app_id: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  return buildAboutMetadata({ appId: params.app_id, locale: DEFAULT_LOCALE });
}

export async function generateStaticParams() {
  return abouts
    .filter((about) => about.locale === DEFAULT_LOCALE)
    .map((about) => ({ app_id: about.appId }));
}

export default async function AboutPage(props: Props) {
  const params = await props.params;
  return <AboutView appId={params.app_id} locale={DEFAULT_LOCALE} />;
}
