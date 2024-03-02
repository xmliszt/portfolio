import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/mdx-content';

import { pages } from '#site/content';

type Props = {
  params: {
    slug: string;
  };
};

function getPageBySlug(slug: string) {
  return pages.find((page) => page.slug === slug);
}

export function generateMetadata({ params }: Props): Metadata {
  const page = getPageBySlug(params.slug);
  if (page == null) return {};
  return { title: page.title };
}

export function generateStaticParams(): Props['params'][] {
  return pages.map((page) => ({ slug: page.slug }));
}

export default function PagePage({ params }: Props) {
  const page = getPageBySlug(params.slug);

  if (page == null) notFound();

  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1>{page.title}</h1>
      <MDXContent code={page.body} />
    </article>
  );
}
