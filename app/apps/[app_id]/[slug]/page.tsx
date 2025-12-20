import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
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

  if (document == null) return {};

  const documentTitle = documentTitles[params.slug] || params.slug;

  return {
    title: `${document.title} | ${params.app_id}`,
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | ${document.title}`,
      description: `${documentTitle} for ${params.app_id}`,
    },
    alternates: {
      canonical: `https://www.liyuxuan.dev/apps/${params.app_id}/${params.slug}`,
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

  const documentTitle = documentTitles[params.slug] || params.slug;

  return (
    <article className="prose prose-stone dark:prose-invert relative">
      <h1 className="group relative">
        <a id="top" className="invisible relative -top-16 block"></a>
        {document.title}
        <ShadowSubtitle>{documentTitle}</ShadowSubtitle>
      </h1>
      <MDXContent code={document.body} />
      <TOCLoader toc={document.toc} showToc={true} />
    </article>
  );
}
