import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ShadowSubtitle } from '@/app/[slug]/shadow-subtitle';
import { openGraph } from '@/app/metadata';
import { TOCLoader } from '@/components/custom/toc/toc-loader';
import { MDXContent } from '@/components/mdx-content';

import { hobbies } from '#site/content';

type HobbyProps = {
  params: { slug: string };
};

function getHobbyBySlug(slug: string) {
  return hobbies.find((hobby) => hobby.slug === slug);
}

export function generateMetadata({ params }: HobbyProps): Metadata {
  const hobby = getHobbyBySlug(params.slug);
  if (hobby == null) return {};
  return {
    title: hobby.title + (hobby.subtitle ? ` | ${hobby.subtitle}` : ''),
    description: hobby.synopsis,
    alternates: { canonical: `/hobbies/${hobby.slug}` },
    openGraph: {
      ...openGraph,
      title: `Li Yuxuan | hobbies | ${hobby.title}`,
      description: hobby.synopsis,
    },
  };
}

export function generateStaticParams(): HobbyProps['params'][] {
  return hobbies.map((hobby) => ({
    slug: hobby.slug,
  }));
}

export default function HobbyPage({ params }: HobbyProps) {
  const hobby = getHobbyBySlug(params.slug);
  if (hobby == null) return notFound();

  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1 className='group relative'>
        <a id='top' className='relative -top-16 block [visibility:hidden]'></a>
        {hobby.title}
        {hobby.subtitle && <ShadowSubtitle>{hobby.subtitle}</ShadowSubtitle>}
      </h1>
      <p>{hobby.synopsis}</p>
      <hr className='my-6' />

      {/* Markdown content */}
      <MDXContent code={hobby.body} />

      <TOCLoader toc={hobby.toc} showToc={true} />
    </article>
  );
}
