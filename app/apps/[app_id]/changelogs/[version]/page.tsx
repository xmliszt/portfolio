import { format, parse } from "date-fns";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getChangelogHeaderImage } from "@/app/apps/changelog-header-images";
import { getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";
import { MDXContent } from "@/components/mdx-content";

import { changelogs } from "#site/content";

function formatDate(dateString: string): string {
  try {
    // Try parsing date in format YYYY-M-D or YYYY-MM-DD
    const parsed = parse(dateString, "yyyy-M-d", new Date());
    return format(parsed, "MMMM d, yyyy");
  } catch {
    return dateString;
  }
}

type Props = {
  params: Promise<{
    app_id: string;
    version: string;
  }>;
};

function getChangelogByAppIdAndVersion(appId: string, version: string) {
  return changelogs.find(
    (changelog) => changelog.appId === appId && changelog.version === version
  );
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const app = getAppById(params.app_id);
  const changelog = getChangelogByAppIdAndVersion(
    params.app_id,
    params.version
  );

  if (!app || !changelog) return {};

  const title = `Version ${changelog.version} | ${app.name} Changelog`;
  const description = `What's new in ${app.name} version ${changelog.version}. Released on ${formatDate(changelog.date)}. View the latest features, improvements, and bug fixes.`;
  const url = `https://www.liyuxuan.dev/apps/${params.app_id}/changelogs/${params.version}`;

  // Use header image for OG if available, otherwise fall back to app's OG images
  const ogImages = app.ogImages;
  const twitterImages = app.ogImagesTwitter;

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
      `version ${changelog.version}`,
    ],
    icons: [app.icon.light, app.icon.dark],
    alternates: {
      canonical: url,
    },
    openGraph: {
      ...openGraph,
      title,
      description,
      images: ogImages,
      url,
      type: "article",
      publishedTime: changelog.date,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@xmliszt",
      creatorId: "1704579643",
      title,
      description,
      images: twitterImages,
      siteId: `1704579643-apps-${params.app_id}-changelog-${params.version}`,
      site: url,
    },
  };
}

export async function generateStaticParams() {
  return changelogs.map((changelog) => ({
    app_id: changelog.appId,
    version: changelog.version,
  }));
}

export default async function ChangelogDetailPage(props: Props) {
  const params = await props.params;
  const app = getAppById(params.app_id);
  const changelog = getChangelogByAppIdAndVersion(
    params.app_id,
    params.version
  );

  if (!app || !changelog) notFound();

  const headerImage = getChangelogHeaderImage(params.app_id, changelog.version);

  return (
    <div className="space-y-6">
      <div className="pb-4">
        <Link href={`/apps/${params.app_id}/changelogs`} className="group">
          <div className="flex items-center gap-2 text-sm">
            <ArrowLeft
              size={18}
              className="group-hover:animate-wobble-horizontal"
            />
            Back to Changelogs
          </div>
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-muted-foreground text-sm font-medium tracking-tight">
          {formatDate(changelog.date)} ⋅ VERSION {changelog.version}
        </h1>
      </div>

      {headerImage && (
        <div className="flex w-full items-center justify-center overflow-hidden">
          <Image
            src={headerImage}
            alt={`Version ${changelog.version} header`}
            width={800}
            height={450}
            className="w-full max-w-[200px] rounded-3xl object-cover"
            unoptimized={headerImage.endsWith(".gif")}
          />
        </div>
      )}

      <article className="prose prose-stone dark:prose-invert max-w-none">
        <MDXContent code={changelog.body} />
      </article>
    </div>
  );
}
