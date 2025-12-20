import { Metadata } from "next";
import Link from "next/link";


import { getAllApps } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";

import { AppIcon } from "./app-icon";
import { ShadowSubtitle } from "../[slug]/shadow-subtitle";

export const metadata: Metadata = {
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

const apps = getAllApps();

export default function AppsPage() {
  return (
    <article className="prose prose-stone dark:prose-invert">
      <header className="space-y-2">
        <h1 className="group relative">
          apps
          <ShadowSubtitle>应用商店</ShadowSubtitle>
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={`/apps/${app.id}`}
            className="group bg-card hover:bg-accent relative flex items-center gap-x-6 rounded-3xl p-4 transition-all hover:scale-[1.01] active:scale-[0.99] border border-border/50"
          >
            <AppIcon
              alt={app.icon.alt}
              lightUrl={app.icon.light}
              darkUrl={app.icon.dark}
              className="size-16 md:size-20 shrink-0 shadow-sm"
            />

            <div className="flex flex-col gap-y-0.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground m-0">
                {app.name}
              </h2>
              {app.subtitle && (
                <p className="text-muted-foreground text-xs font-normal m-0">
                  {app.subtitle}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </article>
  );
}
