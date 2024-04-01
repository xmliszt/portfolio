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
      <span className='absolute left-0 top-0 h-full w-full rounded-xl border border-transparent bg-transparent transition-[border_box-shadow_widht_height] duration-300 ease-in-out group-hover:-left-[1.5rem] group-hover:-top-[1.5rem] group-hover:h-[calc(100%+3rem)] group-hover:w-[calc(100%+3rem)] group-hover:border-border group-hover:shadow-lg'></span>
      <article className='flex flex-col gap-4 transition-transform duration-300 ease-in-out group-hover:scale-[1.02]'>
        <div className='flex items-start justify-between gap-4'>
          <h3>{post.title}</h3>
          <time className='flex flex-col items-end [&>*]:whitespace-nowrap'>
            <span>{format(post.date, 'do LLLL')}</span>
            <span>{format(post.date, 'yyyy')}</span>
          </time>
        </div>
        <p className='after:[content:_"..."]'>{post.excerpt}</p>
        <div className='flex flex-row items-center justify-between gap-4'>
          <div className='flex flex-row flex-wrap gap-2'>
            {post.tags.map((tag) => (
              <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
                {tag}
              </CustomBadgeLink>
            ))}
          </div>
          <p>{views} views</p>
        </div>
      </article>
    </Link>
  );
}
