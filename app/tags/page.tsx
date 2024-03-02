import { CustomLink } from '@/components/ui/custom-link';

import { tags } from '#site/content';

export default function TagsPage() {
  const sortedTags = [...tags].sort((a, b) => a.slug.localeCompare(b.slug));

  return (
    <article className='flex flex-col gap-4 px-4'>
      <h1>Tags</h1>
      <hr />
      <div className='flex flex-col gap-2'>
        {sortedTags.map((tag) => (
          <CustomLink key={tag.slug} href={`/tags/${tag.slug}`}>
            <span>{tag.slug}</span>
          </CustomLink>
        ))}
      </div>
    </article>
  );
}
