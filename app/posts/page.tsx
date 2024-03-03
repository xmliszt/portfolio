import pluralize from 'pluralize';

import { ShadowSubtitle } from '../[slug]/shadow-subtitle';

import { PostCard } from './post-card';

import { posts } from '#site/content';

export default function PostsPage() {
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
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </article>
  );
}
