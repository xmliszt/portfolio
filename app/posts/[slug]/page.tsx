import { format } from 'date-fns';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { TOCLoader } from '@/components/custom/toc/toc-loader';
import { MDXContent } from '@/components/mdx-content';
import { CustomBadgeLink } from '@/components/ui/custom-badge-link';
import { Ratings } from '@/components/ui/ratings';

import { incrementPostView } from './increment-post-view';

import { posts } from '#site/content';

interface PostProps {
  params: {
    slug: string;
  };
}

function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function generateMetadata({ params }: PostProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (post == null) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}` },
  };
}

export function generateStaticParams(): PostProps['params'][] {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: PostProps) {
  const post = getPostBySlug(params.slug);
  if (post == null) return notFound();

  const { views } = await incrementPostView({ slug: params.slug });

  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1>
        <a id='top' className='relative -top-16 block [visibility:hidden]'></a>
        {post.title}
      </h1>
      <div className='flex items-center justify-between'>
        <div className='flex flex-row flex-wrap gap-2'>
          {post.tags.map((tag) => (
            <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
              {tag}
            </CustomBadgeLink>
          ))}
        </div>
        <time className='text-right' dateTime={post.date}>
          {format(post.date, 'do LLLL, yyyy')}
        </time>
      </div>
      <div className='flex items-center justify-between gap-4 pt-4 text-sm leading-tight'>
        <div>{views} views</div>
        <div className='text-right'>
          {post.metadata.readingTime && (
            <span>
              {post.metadata.readingTime} min read ({post.metadata.wordCount}{' '}
              words)
            </span>
          )}
        </div>
      </div>
      {post.description && <p>{post.description}</p>}
      {post.cover && (
        <Image src={post.cover} alt={post.title} className='m-0' />
      )}
      <hr className='mb-6 mt-2' />

      {/* Markdown content */}
      <MDXContent code={post.content} />

      {/* Tags */}
      <div className='mt-10 flex flex-row flex-wrap gap-2'>
        {post.tags.map((tag) => (
          <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
            {tag}
          </CustomBadgeLink>
        ))}
      </div>
      <TOCLoader toc={post.toc} showToc={true} />
      <Ratings id={post.slug} />
    </article>
  );
}
