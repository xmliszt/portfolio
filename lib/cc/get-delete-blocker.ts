type DeletablePost = {
  status: string;
  publish_claimed_at: string | null;
  publish_error: string | null;
};

function isPublishing(post: DeletablePost) {
  return (
    post.status !== "posted" &&
    post.publish_claimed_at !== null &&
    post.publish_error === null
  );
}

/** Return why `post` cannot be deleted: CC is posting it or one of its `children`, or a child repost is already live; `undefined` when it can be deleted. */
export function getDeleteBlocker(options: {
  post: DeletablePost;
  children: readonly (DeletablePost & { kind: string })[];
}) {
  if (isPublishing(options.post) || options.children.some(isPublishing)) {
    return "CC is posting this right now.";
  }
  if (
    options.children.some(
      (child) => child.kind === "repost" && child.status === "posted"
    )
  ) {
    return "This post has a live repost. Delete the repost first.";
  }
  return undefined;
}
