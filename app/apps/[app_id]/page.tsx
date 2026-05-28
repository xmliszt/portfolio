import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllAppIds, getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";
import { fetchAppStoreMedia } from "@/lib/app-store-connect/fetch-media";

import { AppView } from "./app-view";

// Refetch live App Store media at most hourly on ISR.
export const revalidate = 3600;

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
    itunes:
      params.app_id === "joodle"
        ? {
            appId: "6756204776",
          }
        : undefined,
    appleWebApp: {
      title: app.name,
      statusBarStyle: "default",
      startupImage: app.ogImages,
    },
    alternates: {
      canonical: `https://www.liyuxuan.dev/apps/${params.app_id}`,
    },
    openGraph: {
      ...openGraph,
      title: app.name,
      description: app.description,
      images: app.ogImages,
      url: `https://www.liyuxuan.dev/apps/${params.app_id}`,
      type: "website",
    },
    keywords: app.keywords,
    applicationName: app.name,
    icons: [app.icon.light, app.icon.dark],
    twitter: {
      card: "summary_large_image",
      creator: "@xmliszt",
      creatorId: "1704579643",
      title: app.name,
      description: app.description,
      images: app.ogImagesTwitter,
      siteId: `1704579643-apps-${params.app_id}`,
      site: `https://www.liyuxuan.dev/apps/${params.app_id}`,
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

  const liveMedia = app.appStoreConnectAppId
    ? await fetchAppStoreMedia({ appId: app.appStoreConnectAppId })
    : undefined;

  return <AppView app={app} liveMedia={liveMedia} />;
}
