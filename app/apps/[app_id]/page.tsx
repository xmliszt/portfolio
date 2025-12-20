import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllAppIds, getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";

import { AppView } from "./app-view";

type Props = {
  params: Promise<{
    app_id: string;
  }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) return {};

  return {
    title: app.name,
    description: app.description,
    category: "Apps",
    appleWebApp: {
      title: app.name,
      statusBarStyle: "default",
      startupImage: app.ogImage,
    },
    alternates: {
      canonical: `https://www.liyuxuan.dev/apps/${params.app_id}`,
    },
    openGraph: {
      ...openGraph,
      title: app.name,
      description: app.description,
      images: app.ogImage
        ? {
            url: app.ogImage,
            width: 1200,
            height: 630,
            alt: `${app.name} - ${app.subtitle}`,
          }
        : undefined,
    },
    keywords: app.keywords,
    applicationName: app.name,
    icons: [app.icon.light, app.icon.dark],
    twitter: {
      card: "summary_large_image",
      siteId: "1704579643",
      creator: "@xmliszt",
      creatorId: "1704579643",
      title: app.name,
      description: app.description,
      images: app.ogImageTwitter ? [app.ogImageTwitter] : undefined,
    },
  };
}

export async function generateStaticParams() {
  return getAllAppIds().map((app_id) => ({ app_id }));
}

export default async function AppPage(props: Props) {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) notFound();

  return <AppView app={app} />;
}
