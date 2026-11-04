/** `true` if `kind` is "post" or "repost" and `status` is "scheduled" or "posted", except a posted plain repost (`repostAs` "repost") and a custom post (`campaignId` null) once `postedAt` is set; `false` otherwise. */
export function isTrackedPost(options: {
  kind: string;
  status: string;
  repostAs: string;
  campaignId: string | null;
  postedAt: string | null;
}) {
  const isLivePlainRepost =
    options.kind === "repost" &&
    options.repostAs === "repost" &&
    options.status === "posted";
  const isPostedCustomPost =
    options.campaignId === null && options.postedAt !== null;
  return (
    (options.kind === "post" || options.kind === "repost") &&
    !isLivePlainRepost &&
    !isPostedCustomPost &&
    (options.status === "scheduled" || options.status === "posted")
  );
}
