import { Metadata } from 'next';

import { CustomLink } from '@/components/ui/custom-link';

import { tags } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'Tags | 标签',
    alternates: {
      canonical: '/tags',
    },
  };
}

export default function TagsPage() {
  // Sort tags and remove duplicates
  const sortedTags = [...tags]
    .map((tag) => tag.slug)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

  return (
    <article className='flex flex-col gap-4'>
      <h1>Tags</h1>
      <div className='flex flex-col gap-2'>
        {sortedTags.map((tag) => (
          <CustomLink key={tag} href={`/tags/${tag}`} target='_self'>
            <span>{tag}</span>
          </CustomLink>
        ))}
      </div>
    </article>
  );
}
