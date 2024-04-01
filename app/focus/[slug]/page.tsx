import { format } from 'date-fns';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { TOCLoader } from '@/components/custom/toc/toc-loader';
import { MDXContent } from '@/components/mdx-content';
import { HoverPerspectiveContainer } from '@/components/ui/hover-perspective-container';

import { focus as posts } from '#site/content';

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
    alternates: { canonical: `https://liyuxuan.dev/focus/${post.slug}` },
  };
}

export function generateStaticParams(): PostProps['params'][] {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function FocusPostPage({ params }: PostProps) {
  const post = getPostBySlug(params.slug);
  if (post == null) return notFound();

  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1>
        <a id='top' className='relative -top-16 block [visibility:hidden]'></a>
        {post.title}
      </h1>
      {post.updated && (
        <div className='flex flex-col'>
          <time dateTime={post.updated}>
            Updated at: {format(post.updated, 'do LLLL, yyyy')}
          </time>
        </div>
      )}
      {post.description && <p>{post.description}</p>}
      {post.cover && (
        <HoverPerspectiveContainer>
          <Image
            src={post.cover}
            alt={post.title}
            width={200}
            height={200}
            layout='responsive'
            className='m-0 h-full w-full'
            unoptimized
          />
        </HoverPerspectiveContainer>
      )}
      <hr className='my-6' />

      {/* Markdown content */}
      <MDXContent code={post.content} />

      <TOCLoader toc={post.toc} showToc={true} />
    </article>
  );
}
