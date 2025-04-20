import { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShadowSubtitle } from "@/app/[slug]/shadow-subtitle";
import { openGraph } from "@/app/metadata";
import { TOCLoader } from "@/components/custom/toc/toc-loader";
import { MDXContent } from "@/components/mdx-content";

import { hobbies } from "#site/content";

type HobbyProps = {
  params: Promise<{ slug: string }>;
};

function getHobbyBySlug(slug: string) {
  return hobbies.find((hobby) => hobby.slug === slug);
}

export async function generateMetadata(props: HobbyProps): Promise<Metadata> {
  const params = await props.params;
  const hobby = getHobbyBySlug(params.slug);
  if (hobby == null) return {};
  return {
    title: hobby.title + (hobby.subtitle ? ` | ${hobby.subtitle}` : ""),
    description: hobby.synopsis,
    alternates: { canonical: `https://www.liyuxuan.dev/hobbies/${hobby.slug}` },
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | hobbies | ${hobby.title}`,
      description: hobby.synopsis,
    },
  };
}

export async function generateStaticParams() {
  return hobbies.map((hobby) => ({
    slug: hobby.slug,
  }));
}

export default async function HobbyPage(props: HobbyProps) {
  const params = await props.params;
  const hobby = getHobbyBySlug(params.slug);
  if (hobby == null) return notFound();

  return (
    <article className="prose prose-stone dark:prose-invert">
      <h1 className="group relative">
        <a id="top" className="[visibility:hidden] relative -top-16 block"></a>
        {hobby.title}
        {hobby.subtitle && <ShadowSubtitle>{hobby.subtitle}</ShadowSubtitle>}
      </h1>
      <p>{hobby.synopsis}</p>
      <hr className="my-6" />

      {/* Markdown content */}
      <MDXContent code={hobby.body} />

      <TOCLoader toc={hobby.toc} showToc={true} />
    </article>
  );
}
