import { format, parse } from "date-fns";
import { startCase } from "lodash";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";

import { changelogs } from "#site/content";

type Props = {
  params: Promise<{
    app_id: string;
  }>;
};

function getChangelogsByAppId(appId: string) {
  return changelogs
    .filter((changelog) => changelog.appId === appId)
    .toSorted((a, b) => {
      // Sort by version descending using semantic version comparison
      const versionA = a.version.split(".").map(Number);
      const versionB = b.version.split(".").map(Number);

      for (let i = 0; i < Math.max(versionA.length, versionB.length); i++) {
        const partA = versionA.at(i) ?? 0;
        const partB = versionB.at(i) ?? 0;
        if (partA !== partB) {
          return partB - partA;
        }
      }
      return 0;
    });
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) return {};

  const title = `Changelogs | ${app.name}`;
  const description = `View all version changelogs and release notes for ${app.name}. Stay updated with the latest features, improvements, and bug fixes.`;
  const url = `https://www.liyuxuan.dev/apps/${params.app_id}/changelogs`;

  return {
    title,
    description,
    category: "Apps",
    applicationName: app.name,
    keywords: [
      ...(app.keywords ?? []),
      "changelog",
      "release notes",
      "version history",
      "updates",
      "what's new",
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
      siteId: `1704579643-apps-${params.app_id}-changelogs`,
      site: url,
    },
  };
}

export async function generateStaticParams() {
  const appIds = new Set(changelogs.map((changelog) => changelog.appId));
  return Array.from(appIds).map((app_id) => ({ app_id }));
}

function formatDate(dateString: string): string {
  try {
    // Try parsing date in format YYYY-M-D or YYYY-MM-DD
    const parsed = parse(dateString, "yyyy-M-d", new Date());
    return format(parsed, "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

export default async function ChangelogsPage(props: Props) {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) notFound();

  const appChangelogs = getChangelogsByAppId(params.app_id);

  if (appChangelogs.length === 0) notFound();

  return (
    <div className="w-full space-y-8">
      <div className="pb-4">
        <Link href={`/apps/${params.app_id}`} className="group">
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeft
              size={18}
              className="group-hover:animate-wobble-horizontal"
            />
            Back to {startCase(params.app_id)}
          </div>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Changelogs</h1>
        <p className="text-muted-foreground">
          Version history and updates for {app.name}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {appChangelogs.map((changelog, index) => (
          <Link
            key={changelog.version}
            href={`/apps/${params.app_id}/changelogs/${changelog.version}`}
            className="group bg-card hover:bg-accent rounded-xl border p-5 transition-colors"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Version {changelog.version}
                </span>
                {index === 0 && (
                  <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    Latest
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                {formatDate(changelog.date)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
