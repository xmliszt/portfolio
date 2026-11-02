/** Return the account (DID or handle) and record key of a `bsky.app/profile/<actor>/post/<rkey>` link, or `undefined` when `url` is not one. */
export function parseBlueskyPostUrl(url: string) {
  const match = /bsky\.app\/profile\/([^/?#]+)\/post\/([^/?#]+)/.exec(url);
  const actor = match?.at(1);
  const recordKey = match?.at(2);
  return actor === undefined || recordKey === undefined
    ? undefined
    : { actor: decodeURIComponent(actor), recordKey };
}
