/** `true` if `kind` is "post" or "repost" and `status` is "scheduled" or "posted", except a posted plain repost (`repostAs` "repost"); `false` otherwise. */
export function isTrackedPost(options: {
  kind: string;
  status: string;
  repostAs: string;
}) {
  const isLivePlainRepost =
    options.kind === "repost" &&
    options.repostAs === "repost" &&
    options.status === "posted";
  return (
    (options.kind === "post" || options.kind === "repost") &&
    !isLivePlainRepost &&
    (options.status === "scheduled" || options.status === "posted")
  );
}
