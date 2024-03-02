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
      <h1>Posts</h1>
      <div className='flex flex-col gap-16'>
        {sortedPosts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </article>
  );
}
