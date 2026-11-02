/** `true` if `kind` is "post" or "repost" (but not a plain repost, `repostAs` "repost") and `status` is "scheduled" or "posted"; `false` otherwise. */
export function isTrackedPost(options: {
  kind: string;
  status: string;
  repostAs: string;
}) {
  const isPlainRepost =
    options.kind === "repost" && options.repostAs === "repost";
  return (
    (options.kind === "post" || options.kind === "repost") &&
    !isPlainRepost &&
    (options.status === "scheduled" || options.status === "posted")
  );
}
