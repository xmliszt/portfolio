import { format } from 'date-fns';
import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { CustomBadgeLink } from '@/components/custom/custom-badge-link';
import { MDXContent } from '@/components/mdx-content';

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
  return { title: post.title, description: post.description };
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
      <h1>{post.title}</h1>
      <div className='flex flex-row flex-wrap gap-2'>
        {post.tags.map((tag) => (
          <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
            {tag}
          </CustomBadgeLink>
        ))}
      </div>
      <p>
        <time dateTime={post.date}>{format(post.date, 'do LLLL, yyyy')}</time>
        <span> - {views} views</span>
      </p>
      {post.description && <p>{post.description}</p>}
      {post.cover && (
        <Image src={post.cover} alt={post.title} placeholder='blur' />
      )}
      <hr className='mb-0' />
      {/* Table of contents */}
      <nav>
        <ul>
          {post.toc.map((toc) => (
            <li key={toc.url}>
              <a href={toc.url}>{toc.title}</a>
            </li>
          ))}
        </ul>
      </nav>

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
    </article>
  );
}
