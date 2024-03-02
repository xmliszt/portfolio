import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PostCard } from '@/app/posts/post-card';

import { posts } from '#site/content';

interface PostProps {
  params: {
    slug: string;
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

export function generateMetadata({ params }: PostProps): Metadata {
  return {
    title: `Posts | ${params.slug}`,
    description: `Posts tagged with ${params.slug}`,
  };
}

export function generateStaticParams(): PostProps['params'][] {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function PostPage({ params }: PostProps) {
  const posts = getPostsByTag(params.slug);

  if (posts.length <= 0) notFound();

  return (
    <article className='flex flex-col gap-12'>
      <h1>Tag: {params.slug}</h1>
      <div className='flex flex-col gap-16'>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </article>
  );
}
