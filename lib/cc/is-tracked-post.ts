/** `true` if `kind` is "post" or "repost", or "reply" on a custom post (`campaignId` null) with no `parentPostId`, and `status` is "scheduled" or "posted", except a posted plain repost (`repostAs` "repost") and a custom post (`campaignId` null) once `postedAt` is set; `false` otherwise. */
export function isTrackedPost(options: {
  kind: string;
  status: string;
  repostAs: string;
  parentPostId: string | null;
  campaignId: string | null;
  postedAt: string | null;
}) {
  const isLivePlainRepost =
    options.kind === "repost" &&
    options.repostAs === "repost" &&
    options.status === "posted";
  const isPostedCustomPost =
    options.campaignId === null && options.postedAt !== null;
  const isCustomReply =
    options.kind === "reply" &&
    options.campaignId === null &&
    options.parentPostId === null;
  return (
    (options.kind === "post" || options.kind === "repost" || isCustomReply) &&
    !isLivePlainRepost &&
    !isPostedCustomPost &&
    (options.status === "scheduled" || options.status === "posted")
  );
}
