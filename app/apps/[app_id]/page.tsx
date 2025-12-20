import { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAppById } from "@/app/apps/data";
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

  if (!app) {
    return {};
  }

  return {
    title: `${app.name} | Apps`,
    alternates: {
      canonical: `https://www.liyuxuan.dev/apps/${params.app_id}`,
    },
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | ${app.name}`,
      description: app.description,
    },
  };
}

export async function generateStaticParams() {
  const { getAllAppIds } = await import("../data");
  return getAllAppIds().map((app_id) => ({ app_id }));
}

export default async function AppPage(props: Props) {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) {
    notFound();
  }

  return <AppView app={app} />;
}
