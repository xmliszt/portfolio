import { Metadata } from 'next';
import pluralize from 'pluralize';

import { ShadowSubtitle } from '../[slug]/shadow-subtitle';
import { openGraph } from '../metadata';

import { fetchPostViews } from './[slug]/fetch-post-views';
import { PostCard } from './post-card';

import { posts } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'posts | 碎碎念',
    alternates: {
      canonical: '/posts',
    },
    openGraph: {
      ...openGraph,
      title: 'Li Yuxuan | posts',
    },
  };
}

export default async function PostsPage() {
  const postViews = await fetchPostViews();

  const sortedPosts = posts.sort((a, b) => {
    if (a.date > b.date) {
      return -1;
    } else {
      return 1;
    }
  });

  return (
    <article className='prose prose-stone flex flex-col gap-12 dark:prose-invert'>
      <h1 className='group relative'>
        posts ({pluralize('post', posts.length, true)})
        <ShadowSubtitle>碎碎念</ShadowSubtitle>
      </h1>
      <div className='flex flex-col gap-y-3'>
        {sortedPosts.map((post, index) => (
          <>
            {index > 0 && <hr className='my-1' />}
            <PostCard
              key={post.slug}
              post={post}
              views={
                postViews.find((view) => view.slug === post.slug)?.view ?? 0
              }
            />
          </>
        ))}
      </div>
    </article>
  );
}
