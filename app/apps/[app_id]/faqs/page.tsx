import fs from "fs";
import { startCase } from "lodash";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import path from "path";

import { getAppById } from "@/app/apps/data";
import { openGraph } from "@/app/metadata";
import { MDXContent } from "@/components/mdx-content";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { faqs } from "#site/content";

type Props = {
  params: Promise<{
    app_id: string;
  }>;
};

type FaqSection = {
  id: string;
  title: string;
  order: number;
  items: Array<{
    id: string;
    title: string;
    order: number;
    body: string;
  }>;
};

function getFaqSectionMeta(
  appId: string,
  sectionId: string
): { id: string; title: string; order: number } | undefined {
  const metaPath = path.join(
    process.cwd(),
    "content",
    "apps",
    appId,
    "faqs",
    sectionId,
    "_meta.json"
  );
  try {
    const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
    return meta;
  } catch {
    return undefined;
  }
}

function getFaqsByAppId(appId: string): FaqSection[] {
  const appFaqs = faqs.filter((faq) => faq.appId === appId);

  // Group FAQs by section
  const sectionsMap = new Map<string, FaqSection>();

  for (const faq of appFaqs) {
    const sectionId = faq.sectionId;

    if (!sectionsMap.has(sectionId)) {
      const meta = getFaqSectionMeta(appId, sectionId);
      if (meta) {
        sectionsMap.set(sectionId, {
          id: meta.id,
          title: meta.title,
          order: meta.order,
          items: [],
        });
      }
    }

    const section = sectionsMap.get(sectionId);
    if (section) {
      section.items.push({
        id: faq.id,
        title: faq.title,
        order: faq.order,
        body: faq.body,
      });
    }
  }

  // Sort sections and items by order
  const sections = Array.from(sectionsMap.values())
    .toSorted((a, b) => a.order - b.order)
    .map((section) => ({
      ...section,
      items: section.items.toSorted((a, b) => a.order - b.order),
    }));

  return sections;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) return {};

  const title = `FAQs | ${app.name}`;
  const description = `Frequently asked questions about ${app.name}. Find answers to common questions about features, subscription, iCloud sync, widgets, and more.`;
  const url = `https://www.liyuxuan.dev/apps/${params.app_id}/faqs`;

  return {
    title,
    description,
    category: "Apps",
    applicationName: app.name,
    keywords: [
      ...(app.keywords ?? []),
      "FAQ",
      "frequently asked questions",
      "help",
      "support",
      "troubleshooting",
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
      siteId: `1704579643-apps-${params.app_id}-faqs`,
      site: url,
    },
  };
}

export async function generateStaticParams() {
  const appIds = new Set(faqs.map((faq) => faq.appId));
  return Array.from(appIds).map((app_id) => ({ app_id }));
}

export default async function FaqsPage(props: Props) {
  const params = await props.params;
  const app = getAppById(params.app_id);

  if (!app) notFound();

  const faqSections = getFaqsByAppId(params.app_id);

  if (faqSections.length === 0) notFound();

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
        <h1 className="text-3xl font-bold tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-muted-foreground">
          Find answers to common questions about {app.name}
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {faqSections.map((section) => (
          <div key={section.id} className="space-y-4">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {section.items.map((item) => (
                <AccordionItem key={item.id} value={item.id} id={item.id}>
                  <AccordionTrigger className="h-fit p-0 text-left">
                    {item.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <article className="prose prose-stone dark:prose-invert prose-sm max-w-none">
                      <MDXContent code={item.body} />
                    </article>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
}
