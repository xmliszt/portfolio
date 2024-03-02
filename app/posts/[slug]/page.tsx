import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/mdx-content';

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

export default function PostPage({ params }: PostProps) {
  const post = getPostBySlug(params.slug);

  if (post == null) notFound();

  return (
    <article className='py-6 prose lg:prose-lg dark:prose-invert'>
      <h1>{post.title}</h1>
      {post.description && <p>{post.description}</p>}
      {post.cover && (
        <Image src={post.cover} alt={post.title} placeholder='blur' />
      )}
      <hr className='my-4' />
      <MDXContent code={post.content} />
    </article>
  );
}
