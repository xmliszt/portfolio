/** Return the post id in an X or Twitter post URL (`…/status/<id>`), or `undefined` when `url` is not one. */
export function parseXStatusId(url: string) {
  return /(?:x|twitter)\.com\/(?:[^/]+|i\/web)\/status\/(\d{1,19})/
    .exec(url)
    ?.at(1);
}
