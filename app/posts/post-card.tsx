import { format } from 'date-fns';
import Link from 'next/link';

import { CustomBadgeLink } from '@/components/ui/custom-badge-link';

type PostCardProps = {
  post: (typeof import('#site/content').posts)[0];
  views: number;
};

export function PostCard({ post, views }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className='group relative'>
      <article className='flex flex-col gap-y-2 transition-transform hover:scale-105'>
        <div className='flex items-start justify-between gap-4'>
          <h3 className='mb-1 mt-0 text-base font-semibold'>{post.title}</h3>
          <time className='flex flex-col items-end text-xs text-muted-foreground [&>*]:whitespace-nowrap'>
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
          <p className='text-xs text-muted-foreground'>{views} views</p>
        </div>
      </article>
    </Link>
  );
}
