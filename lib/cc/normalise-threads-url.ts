const THREADS_HOSTS = ["threads.net", "threads.com"];

/** Return the path of a Threads post URL without its trailing slash, query or hash, so `threads.net` and `threads.com` links to one post match; `undefined` when `url` is not a Threads link. */
export function normaliseThreadsUrl(url: string) {
  const trimmed = url.trim();
  if (trimmed === "") return undefined;
  try {
    const parsed = new URL(
      /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    );
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (!THREADS_HOSTS.includes(host)) return undefined;
    const path = parsed.pathname.replace(/\/+$/, "");
    return path === "" ? undefined : path;
  } catch {
    return undefined;
  }
}
