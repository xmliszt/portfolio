import { format } from 'date-fns';
import Link from 'next/link';

import { CustomBadgeLink } from '@/components/ui/custom-badge-link';

type PostCardProps = {
  post: (typeof import('#site/content').posts)[0];
  views: number;
};

export function PostCard({ post, views }: PostCardProps) {
  return (
    <article className='flex flex-col gap-y-2'>
      <div className='flex items-start justify-between gap-4'>
        <Link href={`/posts/${post.slug}`} className='group relative'>
          <h3 className='hover:text-foreground text-foreground sm:text-muted-foreground mt-0 mb-1 text-base font-semibold transition-colors'>
            {post.title}
          </h3>
        </Link>
        <time className='text-muted-foreground flex flex-col items-end text-xs *:whitespace-nowrap'>
          <span>{format(post.date, 'do LLLL')}</span>
          <span>{format(post.date, 'yyyy')}</span>
        </time>
      </div>
      <p className='text-sm font-normal after:[content:_"..."]'>
        {post.excerpt}
      </p>
      <div className='flex flex-row items-center justify-between gap-4'>
        <div className='flex flex-row flex-wrap gap-2'>
          {post.tags.map((tag) => (
            <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
              {tag}
            </CustomBadgeLink>
          ))}
        </div>
        <p className='text-muted-foreground text-xs'>{views} views</p>
      </div>
    </article>
  );
}
