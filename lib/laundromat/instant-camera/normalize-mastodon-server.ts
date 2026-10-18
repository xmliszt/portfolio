/** Return the host name in what the visitor typed for their Mastodon server, lowercased and without scheme, path or `@user`, or `undefined` when it is not a plausible host. */
export function normalizeMastodonServer(input: string) {
  const host = input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^@?[^@/]*@/, "")
    .replace(/[/?#].*$/, "");
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : undefined;
}
