import { format } from 'date-fns';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { CustomBadgeLink } from '@/components/custom/custom-badge-link';
import { CustomLink } from '@/components/ui/custom-link';
import { cn } from '@/lib/utils';

import { posts } from '#site/content';

interface PostProps {
  params: {
    slug: string;
  };
}

function getPostsByTag(tag: string) {
  return posts.filter((post) => post.tags.includes(tag));
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
    <div>
      <h1 className='mb-4'>Tag: {params.slug}</h1>
      {posts.map((post) => (
        <article
          key={post.slug}
          className={cn('flex flex-col gap-4', post.featured ? '' : '')}
        >
          <div className='flex justify-between items-center'>
            <CustomLink href={`/posts/${post.slug}`}>
              <h2>{post.title}</h2>
            </CustomLink>
            <span>{format(post.date, 'do LLLL, yyyy')}</span>
          </div>
          <p>{post.excerpt}</p>
          <div className='flex flex-row gap-2 flex-wrap'>
            {post.tags.map((tag) => (
              <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
                {tag}
              </CustomBadgeLink>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
