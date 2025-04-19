import { Fragment } from 'react';
import { Metadata } from 'next';
import pluralize from 'pluralize';

import { ShadowSubtitle } from '@/app/[slug]/shadow-subtitle';
import { openGraph } from '@/app/metadata';

import { fetchPostViews } from './[slug]/fetch-post-views';
import { PostCard } from './post-card';

import { posts } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'posts | 碎碎念',
    alternates: {
      canonical: 'https://www.liyuxuan.dev/posts',
    },
    openGraph: {
      ...openGraph,
      title: 'Li Yuxuan | posts',
      description:
        'A collection of my thoughts and experiences. These are some of the things I have written.',
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
    <article className='prose prose-stone dark:prose-invert flex flex-col gap-12'>
      <h1 className='group relative'>
        posts ({pluralize('post', posts.length, true)})
        <ShadowSubtitle>碎碎念</ShadowSubtitle>
      </h1>
      <div className='flex flex-col gap-y-3'>
        {sortedPosts.map((post, index) => (
          <Fragment key={post.slug}>
            {index > 0 && <hr className='my-1' />}
            <PostCard
              key={post.slug}
              post={post}
              views={
                postViews.find((view) => view.slug === post.slug)?.view ?? 0
              }
            />
          </Fragment>
        ))}
      </div>
    </article>
  );
}
