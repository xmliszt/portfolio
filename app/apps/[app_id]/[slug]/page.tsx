import { startCase } from "lodash";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
import { getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";
import { TOCLoader } from "@/components/custom/toc/toc-loader";
import { MDXContent } from "@/components/mdx-content";

import { apps } from "#site/content";

type Props = {
  params: Promise<{
    app_id: string;
    slug: string;
  }>;
};

function getAppDocumentBySlugAndAppId(appId: string, slug: string) {
  return apps.find((app) => app.appId === appId && app.slug === slug);
}

const documentTitles: Record<string, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const document = getAppDocumentBySlugAndAppId(params.app_id, params.slug);
  const app = getAppById(params.app_id);

  if (document == null || app == null) return {};

  const documentTitle = documentTitles[params.slug] ?? params.slug;
  const title = `${startCase(documentTitle)} | ${app.name}`;
  const description = `${documentTitle} for ${app.name}. Learn about how we handle your data and the terms governing your use of ${app.name}.`;
  const url = `https://www.liyuxuan.dev/apps/${params.app_id}/${params.slug}`;

  return {
    title,
    description,
    category: "Apps",
    applicationName: app.name,
    keywords: [
      ...(app.keywords ?? []),
      documentTitle.toLowerCase(),
      "legal",
      "terms",
      "privacy",
    ],
    icons: [app.icon.light, app.icon.dark],
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...openGraph,
      title,
      description,
      images: app.ogImages,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      creator: "@xmliszt",
      creatorId: "1704579643",
      title,
      description,
      images: app.ogImagesTwitter,
      siteId: `1704579643-apps-${params.app_id}-${params.slug}`,
      site: url,
    },
  };
}

export async function generateStaticParams() {
  const params: Array<{ app_id: string; slug: string }> = [];

  apps.forEach((app) => {
    params.push({
      app_id: app.appId,
      slug: app.slug,
    });
  });

  return params;
}

export default async function AppDocumentPage(props: Props) {
  const params = await props.params;
  const document = getAppDocumentBySlugAndAppId(params.app_id, params.slug);

  if (document == null) notFound();

  return (
    <article className="prose prose-stone dark:prose-invert relative">
      <h1 className="group relative">
        <a id="top" className="invisible relative -top-16 block"></a>
        {document.title}
        <ShadowSubtitle>{document.subtitle}</ShadowSubtitle>
      </h1>
      <MDXContent code={document.body} />
      <TOCLoader toc={document.toc} showToc={true} />
    </article>
  );
}
