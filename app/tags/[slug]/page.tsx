import type { Metadata } from "next";
import { notFound } from "next/navigation";
import pluralize from "pluralize";

import { openGraph } from "@/app/metadata";
import { fetchPostViews } from "@/app/posts/[slug]/fetch-post-views";
import { PostCard } from "@/app/posts/post-card";

import { posts, tags } from "#site/content";

export const revalidate = 3600;

interface TagProps {
  params: Promise<{
    slug: string;
  }>;
}

function getPostsByTag(tag: string) {
  return posts
    .filter((post) => post.tags.includes(tag))
    .sort((a, b) => {
      if (a.date > b.date) {
        return -1;
      } else {
        return 1;
      }
    });
}

export async function generateMetadata(props: TagProps): Promise<Metadata> {
  const params = await props.params;
  const postCount = getPostsByTag(params.slug).length;
  return {
    title: `posts | ${params.slug}`,
    description: `${pluralize("post", postCount, true)} tagged with ${params.slug}`,
    alternates: {
      canonical: `https://liyuxuan.dev/tags/${params.slug}`,
    },
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | tags | ${params.slug}`,
      description: `A collection of my thoughts and experiences. These are some of the things I have written. Here are ${pluralize("post", postCount, true)} tagged with ${params.slug}.`,
    },
  };
}

export async function generateStaticParams() {
  return tags.map((tag) => ({
    slug: tag.slug,
  }));
}

export default async function PostPage(props: TagProps) {
  const params = await props.params;
  const postViews = await fetchPostViews();
  const posts = getPostsByTag(params.slug);
  const tag = tags.find((tag) => tag.slug === params.slug);

  if (posts.length <= 0) return notFound();
  if (tag == null) return notFound();

  return (
    <article className="prose prose-stone dark:prose-invert flex flex-col gap-12">
      <h1>
        tag: {params.slug} ({pluralize("post", tag.count.posts, true)})
      </h1>
      <div className="flex flex-col gap-16">
        {posts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            views={postViews.find((view) => view.slug === post.slug)?.view ?? 0}
          />
        ))}
      </div>
    </article>
  );
}
