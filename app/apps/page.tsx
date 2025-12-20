import { Metadata } from "next";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
import { getAllApps } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";

import { AppsList } from "./apps-list";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "apps | Li Yuxuan",
    alternates: {
      canonical: "https://www.liyuxuan.dev/apps",
    },
    openGraph: {
      ...openGraph,
      title: "Li Yuxuan | apps",
      description: "A collection of apps I have built.",
    },
  };
}

const apps = getAllApps();

export default function AppsPage() {
  return (
    <article className="prose prose-stone dark:prose-invert flex flex-col">
      <header className="space-y-2">
        <h1 className="group relative mt-0">
          apps
          <ShadowSubtitle>应用商店</ShadowSubtitle>
        </h1>
      </header>

      <AppsList apps={apps} />
    </article>
  );
}
