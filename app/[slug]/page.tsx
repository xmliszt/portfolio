import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { openGraph } from '@/app/metadata';
import { TOCLoader } from '@/components/custom/toc/toc-loader';
import { MDXContent } from '@/components/mdx-content';

import { ShadowSubtitle } from './shadow-subtitle';

import { pages } from '#site/content';

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

function getPageBySlug(slug: string) {
  return pages.find((page) => page.slug === slug);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const page = getPageBySlug(params.slug);
  if (page == null) return {};
  return {
    title: page.title + (page.subtitle ? ` | ${page.subtitle}` : ''),
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | ${page.title}`,
      description: page.ogDescription ?? openGraph?.description ?? '',
    },
    alternates: {
      canonical: `https://www.liyuxuan.dev/${page.slug}`,
    },
  };
}

export async function generateStaticParams() {
  return pages.map((page) => ({ slug: page.slug }));
}

export default async function PagePage(props: Props) {
  const params = await props.params;
  const page = getPageBySlug(params.slug);

  if (page == null) notFound();

  return (
    <article className='prose prose-stone dark:prose-invert relative'>
      <h1 className='group relative'>
        <a id='top' className='[visibility:hidden] relative -top-16 block'></a>
        {page.title}
        {page.subtitle && <ShadowSubtitle>{page.subtitle}</ShadowSubtitle>}
      </h1>
      <MDXContent code={page.body} />
      <TOCLoader toc={page.toc} showToc={page.showToc} />
    </article>
  );
}
