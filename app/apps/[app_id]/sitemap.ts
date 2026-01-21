import { MetadataRoute } from "next";

import { getAllAppIds, getAppById } from "@/app/apps/data";

import { apps, changelogs, faqs } from "#site/content";

const BASE_URL = "https://liyuxuan.dev";

export async function generateSitemaps() {
  return getAllAppIds().map((appId) => ({ id: appId }));
}

type Props = { id: string };

export default async function sitemap(
  props: Props
): Promise<MetadataRoute.Sitemap> {
  const appId = props.id;
  const app = getAppById(appId);

  if (!app) {
    return [];
  }

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Main app page
  sitemapEntries.push({
    url: `${BASE_URL}/apps/${appId}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  });

  // App document pages (privacy policy, terms of service, support, etc.)
  const appDocuments = apps.filter((doc) => doc.appId === appId);
  appDocuments.forEach((doc) => {
    sitemapEntries.push({
      url: `${BASE_URL}/apps/${appId}/${doc.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });

  // Changelogs index page
  const appChangelogs = changelogs.filter(
    (changelog) => changelog.appId === appId
  );
  if (appChangelogs.length > 0) {
    sitemapEntries.push({
      url: `${BASE_URL}/apps/${appId}/changelogs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });

    // Individual changelog pages
    appChangelogs.forEach((changelog) => {
      const changelogDate = changelog.date
        ? new Date(changelog.date)
        : new Date();
      sitemapEntries.push({
        url: `${BASE_URL}/apps/${appId}/changelogs/${changelog.version}`,
        lastModified: changelogDate,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });
  }

  // FAQs page
  const appFaqs = faqs.filter((faq) => faq.appId === appId);
  if (appFaqs.length > 0) {
    sitemapEntries.push({
      url: `${BASE_URL}/apps/${appId}/faqs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    });
  }

  return sitemapEntries;
}
