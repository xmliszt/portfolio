import { startCase } from "lodash";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";
import { MDXContent } from "@/components/mdx-content";
import { DEFAULT_LOCALE, type Locale,SUPPORTED_LOCALES } from "@/lib/i18n";

import { abouts } from "#site/content";

const LOCALE_LABELS: { [_key in Locale]: string } = {
  en: "English",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  ko: "한국어",
  fr: "Français",
  ja: "日本語",
  tr: "Türkçe",
};

export function getAboutDocument(appId: string, locale: Locale) {
  return abouts.find(
    (about) => about.appId === appId && about.locale === locale
  );
}

function getAvailableAboutLocales(appId: string): Locale[] {
  return SUPPORTED_LOCALES.filter((locale) =>
    abouts.some((about) => about.appId === appId && about.locale === locale)
  );
}

export function buildAboutMetadata(options: {
  appId: string;
  locale: Locale;
}): Metadata {
  const document = getAboutDocument(options.appId, options.locale);
  const app = getAppById(options.appId);

  if (document == null || app == null) return {};

  const title = `${document.title} | ${app.name}`;
  const description = document.description ?? app.description;
  const url = `https://www.liyuxuan.dev${document.permalink}`;

  const languages = Object.fromEntries(
    getAvailableAboutLocales(options.appId).flatMap((locale) => {
      const doc = getAboutDocument(options.appId, locale);
      if (doc == null) return [];
      return [[doc.locale, `https://www.liyuxuan.dev${doc.permalink}`]];
    })
  );

  return {
    title,
    description,
    category: "Apps",
    applicationName: app.name,
    keywords: [
      ...(app.keywords ?? []),
      "about",
      "story",
      "indie developer",
      "solo developer",
    ],
    icons: [app.icon.light, app.icon.dark],
    alternates: {
      canonical: url,
      languages: {
        ...languages,
        "x-default": `https://www.liyuxuan.dev/apps/${options.appId}/about`,
      },
    },
    openGraph: {
      ...openGraph,
      title,
      description,
      images: [`/apps/${options.appId}/about-cover.jpg`],
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@xmliszt",
      creatorId: "1704579643",
      title,
      description,
      images: [`/apps/${options.appId}/about-cover.jpg`],
      siteId: `1704579643-apps-${options.appId}-about`,
      site: url,
    },
  };
}

type AboutViewProps = {
  appId: string;
  locale: Locale;
};

export function AboutView(props: AboutViewProps) {
  const app = getAppById(props.appId);
  const document = getAboutDocument(props.appId, props.locale);

  if (app == null || document == null) notFound();

  const availableLocales = getAvailableAboutLocales(props.appId);

  return (
    <div className="w-full space-y-8">
      <div className="pb-4">
        <Link href={`/apps/${props.appId}`} className="group">
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeft
              size={18}
              className="group-hover:animate-wobble-horizontal"
            />
            Back to {startCase(props.appId)}
          </div>
        </Link>
      </div>

      <div className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{document.title}</h1>

        {availableLocales.length > 1 && (
          <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
            {availableLocales.map((locale, index) => (
              <span key={locale} className="flex items-center gap-x-2">
                {index > 0 && <span>·</span>}
                {locale === props.locale ? (
                  <span className="text-foreground font-medium">
                    {LOCALE_LABELS[locale]}
                  </span>
                ) : (
                  <Link
                    href={
                      locale === DEFAULT_LOCALE
                        ? `/apps/${props.appId}/about`
                        : `/apps/${props.appId}/about/${locale}`
                    }
                    className="hover:text-foreground hover:underline"
                  >
                    {LOCALE_LABELS[locale]}
                  </Link>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border">
        <Image
          src={`/apps/${props.appId}/about-cover.jpg`}
          alt={document.coverAlt ?? document.title}
          width={1536}
          height={864}
          priority
          className="h-auto w-full"
        />
      </div>

      <article
        lang={props.locale}
        className="prose prose-stone dark:prose-invert prose-p:leading-relaxed prose-blockquote:border-l-2 prose-blockquote:border-orange-400 prose-blockquote:text-foreground prose-blockquote:not-italic prose-blockquote:font-medium prose-blockquote:[quotes:none] max-w-none"
      >
        <MDXContent code={document.body} />
      </article>
    </div>
  );
}
