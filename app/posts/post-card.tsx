import { format } from 'date-fns';
import Link from 'next/link';

import { CustomBadgeLink } from '@/components/custom/custom-badge-link';

type PostCardProps = {
  post: (typeof import('#site/content').posts)[0];
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`} className='group'>
      <article className='flex flex-col gap-4 rounded-xl border border-transparent transition-[background_padding_box-shadow_border] ease-in-out group-hover:border-border group-hover:p-4 group-hover:shadow-lg'>
        <div className='flex items-center justify-between'>
          <h2>{post.title}</h2>
          <time>{format(post.date, 'do LLLL, yyyy')}</time>
        </div>
        <p>{post.excerpt}</p>
        <div className='flex flex-row flex-wrap gap-2'>
          {post.tags.map((tag) => (
            <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
              {tag}
            </CustomBadgeLink>
          ))}
        </div>
      </article>
    </Link>
  );
}
