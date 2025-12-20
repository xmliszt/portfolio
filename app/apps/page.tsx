import { Metadata } from "next";
import Link from "next/link";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
import { getAllApps } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";

import { AppIcon } from "./app-icon";

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
            className="group bg-card hover:bg-accent border-border/50 relative flex items-center gap-x-6 rounded-3xl border p-4 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            <AppIcon
              alt={app.icon.alt}
              lightUrl={app.icon.light}
              darkUrl={app.icon.dark}
              className="size-16 shrink-0 shadow-sm md:size-20"
            />

            <div className="flex flex-col gap-y-0.5">
              <h2 className="text-foreground m-0 text-xl font-bold tracking-tight">
                {app.name}
              </h2>
              {app.subtitle && (
                <p className="text-muted-foreground m-0 text-xs font-normal">
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
