import { format } from 'date-fns';

import { CustomBadgeLink } from '@/components/custom/custom-badge-link';
import { CustomLink } from '@/components/ui/custom-link';
import { cn } from '@/lib/utils';

import { posts } from '#site/content';

export default function PostsPage() {
  return (
    <div>
      {posts.map((post) => (
        <article
          key={post.slug}
          className={cn('flex flex-col gap-4', post.featured ? '' : '')}
        >
          <div className='flex justify-between items-center'>
            <CustomLink href={`/posts/${post.slug}`}>
              <h2>{post.title}</h2>
            </CustomLink>
            <span>{format(post.date, 'do LLLL, yyyy')}</span>
          </div>
          <p>{post.excerpt}</p>
          <div className='flex flex-row gap-2 flex-wrap'>
            {post.tags.map((tag) => (
              <CustomBadgeLink key={tag} href={`/tags/${tag}`}>
                {tag}
              </CustomBadgeLink>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
