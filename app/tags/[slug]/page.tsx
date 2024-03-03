import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import pluralize from 'pluralize';

import { PostCard } from '@/app/posts/post-card';

import { posts, tags } from '#site/content';

interface TagProps {
  params: {
    slug: string;
    postCount: number;
  };
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

export function generateMetadata({ params }: TagProps): Metadata {
  return {
    title: `Posts | ${params.slug}`,
    description: `${params.postCount} posts tagged with ${params.slug}`,
  };
}

export function generateStaticParams(): { slug: string }[] {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function PostPage({ params }: TagProps) {
  const posts = getPostsByTag(params.slug);
  const tag = tags.find((tag) => tag.slug === params.slug);

  if (posts.length <= 0) return notFound();
  if (tag == null) return notFound();

  return (
    <article className='flex flex-col gap-12'>
      <h1>
        Tag: {params.slug} ({pluralize('post', tag.count.posts, true)})
      </h1>
      <div className='flex flex-col gap-16'>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </article>
  );
}
