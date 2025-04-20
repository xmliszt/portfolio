import { Metadata } from "next";

import { openGraph } from "@/app/metadata";
import { CustomLink } from "@/components/ui/custom-link";

import { tags } from "#site/content";

export function generateMetadata(): Metadata {
  return {
    title: "tags | 标签",
    alternates: { canonical: "https://www.liyuxuan.dev/tags" },
    openGraph: {
      ...openGraph,
      title: "Li Yuxuan | tags",
      description:
        "A collection of my thoughts and experiences. These are some of the things I have written.",
    },
  };
}

export default function TagsPage() {
  // Sort tags and remove duplicates
  const sortedTags = [...tags]
    .map((tag) => tag.slug)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  return (
    <article className="prose prose-stone dark:prose-invert flex flex-col gap-4">
      <h1>tags</h1>
      <div className="flex flex-col gap-2">
        {sortedTags.map((tag) => (
          <CustomLink key={tag} href={`/tags/${tag}`} target="_self">
            <span>{tag}</span>
          </CustomLink>
        ))}
      </div>
    </article>
  );
}
