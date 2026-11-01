import keyBy from "lodash/keyBy.js";

import { normaliseThreadsUrl } from "./normalise-threads-url";

/** Pair each post whose `url` points at one of `threads` (by normalised permalink) with that thread's media id; posts and threads without a match are left out. */
export function matchThreadsPosts(options: {
  threads: readonly { id: string; permalink: string | undefined }[];
  posts: readonly { id: string; url: string | null }[];
}) {
  const threadsByPath = keyBy(
    options.threads.flatMap((thread) => {
      const path =
        thread.permalink === undefined
          ? undefined
          : normaliseThreadsUrl(thread.permalink);
      return path === undefined ? [] : [{ path, mediaId: thread.id }];
    }),
    (thread) => thread.path
  );
  return options.posts.flatMap((post) => {
    const path = post.url === null ? undefined : normaliseThreadsUrl(post.url);
    const thread = path === undefined ? undefined : threadsByPath[path];
    return thread === undefined
      ? []
      : [{ postId: post.id, mediaId: thread.mediaId }];
  });
}
