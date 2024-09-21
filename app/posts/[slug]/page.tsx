import { format } from 'date-fns';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { openGraph } from '@/app/metadata';
import { TOCLoader } from '@/components/custom/toc/toc-loader';
import { MDXContent } from '@/components/mdx-content';
import { CustomBadgeLink } from '@/components/ui/custom-badge-link';
import { Ratings } from '@/components/ui/ratings';

import { incrementPostView } from './increment-post-view';

import { posts } from '#site/content';

interface PostProps {
  params: { slug: string };
}

function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug);
}

export function generateMetadata({ params }: PostProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (post == null) return {};
  return {
    title: `Li Yuxuan | ${post.title}`,
    description: post.description,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | posts | ${post.title}`,
    },
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
      <div className='mt-6 flex items-end justify-between'>
        <div className='flex flex-row flex-wrap gap-2'>
          {post.tags.map((tag) => (
            <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
              {tag}
            </CustomBadgeLink>
          ))}
        </div>

        <div className='flex flex-col items-end gap-y-1 pt-2 text-right text-xs leading-tight text-muted-foreground'>
          <div>{views} views</div>
          <div>
            {post.metadata.readingTime && (
              <span>
                {post.metadata.readingTime} min read ({post.metadata.wordCount}{' '}
                words)
              </span>
            )}
          </div>
          <time dateTime={post.date}>{format(post.date, 'do LLLL, yyyy')}</time>
        </div>
      </div>

      {post.description && <p>{post.description}</p>}
      {post.cover && (
        <Image src={post.cover} alt={post.title} className='m-0' />
      )}
      <hr className='mb-6 mt-2' />

      {/* Markdown content */}
      <MDXContent code={post.content} />

      <TOCLoader toc={post.toc} showToc={true} />
      <Ratings id={post.slug} />

      <div className='mt-6 flex items-end justify-between'>
        <div className='flex flex-row flex-wrap gap-2'>
          {post.tags.map((tag) => (
            <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
              {tag}
            </CustomBadgeLink>
          ))}
        </div>

        <div className='flex flex-col items-end gap-y-1 pt-2 text-right text-xs leading-tight text-muted-foreground'>
          <div>{views} views</div>
          <div>
            {post.metadata.readingTime && (
              <span>
                {post.metadata.readingTime} min read ({post.metadata.wordCount}{' '}
                words)
              </span>
            )}
          </div>
          <time dateTime={post.date}>{format(post.date, 'do LLLL, yyyy')}</time>
        </div>
      </div>
    </article>
  );
}
