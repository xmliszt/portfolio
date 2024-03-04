import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TOCLoader } from '@/components/custom/toc-loader';
import { MDXContent } from '@/components/mdx-content';

import { ShadowSubtitle } from './shadow-subtitle';

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
    <article className='prose prose-stone relative dark:prose-invert'>
      <h1 className='group relative'>
        {page.title}
        {page.subtitle && <ShadowSubtitle>{page.subtitle}</ShadowSubtitle>}
      </h1>
      <MDXContent code={page.body} />
      <TOCLoader toc={page.toc} showToc={page.showToc} />
    </article>
  );
}
