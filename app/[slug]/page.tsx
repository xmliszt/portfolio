import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { MDXContent } from '@/components/mdx-content';
import { CustomLink } from '@/components/ui/custom-link';

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

  function renderTOCTree(toc: (typeof pages)[0]['toc']) {
    return (
      <ul className='m-0'>
        {toc.map((heading) => (
          <li key={heading.url} className='m-0 pl-1'>
            <div className='flex flex-row items-start'>
              <CustomLink href={heading.url}>{heading.title}</CustomLink>
            </div>
            {heading.items && renderTOCTree(heading.items)}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <article className='prose prose-stone relative dark:prose-invert'>
      {page.toc && (
        <div className='absolute -right-[240px] top-0 hidden border-l md:block'>
          <div className='sticky top-0 pl-2 text-sm md:max-w-[220px]'>
            {renderTOCTree(page.toc)}
          </div>
        </div>
      )}
      <h1 className='group relative'>
        {page.title}
        {page.subtitle && <ShadowSubtitle>{page.subtitle}</ShadowSubtitle>}
      </h1>
      <MDXContent code={page.body} />
    </article>
  );
}
