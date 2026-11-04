/** Return the post that `originalRef` names, trimmed: as a `url` when it is a link (adding `https://` to a link without a scheme) and as a `platform_post_id` otherwise. */
export function toOriginalPost(originalRef: string) {
  const ref = originalRef.trim();
  if (/^https?:\/\//i.test(ref)) return { platform_post_id: null, url: ref };
  return /^[\w-]+(\.[\w-]+)+\//.test(ref)
    ? { platform_post_id: null, url: `https://${ref}` }
    : { platform_post_id: ref, url: null };
}
