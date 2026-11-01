/** `true` if `kind` is "post" or "repost" and `status` is "scheduled" or "posted"; `false` otherwise. */
export function isTrackedPost(options: { kind: string; status: string }) {
  return (
    (options.kind === "post" || options.kind === "repost") &&
    (options.status === "scheduled" || options.status === "posted")
  );
}
