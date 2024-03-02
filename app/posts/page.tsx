import { PostCard } from './post-card';

import { posts } from '#site/content';

export default function PostsPage() {
  return (
    <article className='flex flex-col gap-4'>
      <h1>Posts</h1>
      <hr />
      <div>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </article>
  );
}
