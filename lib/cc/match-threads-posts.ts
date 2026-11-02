import keyBy from "lodash/keyBy.js";

import { normaliseThreadsUrl } from "./normalise-threads-url";

/** Pair each post with its Threads media id: its `platform_post_id` when set, otherwise the id of the one of `threads` its `url` points at (by normalised permalink); posts without either are left out. */
export function matchThreadsPosts(options: {
  threads: readonly { id: string; permalink: string | undefined }[];
  posts: readonly {
    id: string;
    url: string | null;
    platform_post_id: string | null;
  }[];
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
    if (post.platform_post_id !== null) {
      return [{ postId: post.id, mediaId: post.platform_post_id }];
    }
    const path = post.url === null ? undefined : normaliseThreadsUrl(post.url);
    const thread = path === undefined ? undefined : threadsByPath[path];
    return thread === undefined
      ? []
      : [{ postId: post.id, mediaId: thread.mediaId }];
  });
}
