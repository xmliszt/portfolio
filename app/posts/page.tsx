import { Metadata } from 'next';
import pluralize from 'pluralize';

import { ShadowSubtitle } from '../[slug]/shadow-subtitle';

import { fetchPostViews } from './[slug]/fetch-post-views';
import { PostCard } from './post-card';

import { posts } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'Posts | 碎碎念',
    alternates: {
      canonical: '/posts',
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
    <article className='flex flex-col gap-12'>
      <h1 className='group relative'>
        Posts ({pluralize('post', posts.length, true)})
        <ShadowSubtitle>碎碎念</ShadowSubtitle>
      </h1>
      <div className='flex flex-col gap-16'>
        {sortedPosts.map((post) => (
          <PostCard
            key={post.slug}
            post={post}
            views={postViews.find((view) => view.slug === post.slug)?.view ?? 0}
          />
        ))}
      </div>
    </article>
  );
}
