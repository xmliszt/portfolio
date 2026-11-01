import { type PlatformId, PLATFORMS } from "./platforms";

type ComposeUrl =
  | { kind: "prefilled"; url: string }
  | { kind: "copy-then-open"; url: string };

function buildQuery(params: { [name: string]: string }) {
  return Object.entries(params)
    .map(([name, value]) => `${name}=${encodeURIComponent(value)}`)
    .join("&");
}

/** Return the URL that opens `platformId`'s composer, prefilled with the post when the platform supports it. */
export function buildComposeUrl(options: {
  platformId: PlatformId;
  body: string;
  title?: string;
  link?: string;
  target?: string;
}): ComposeUrl {
  switch (options.platformId) {
    case "x":
      return {
        kind: "prefilled",
        url: `https://x.com/intent/post?${buildQuery({ text: options.body })}`,
      };
    case "threads":
      return {
        kind: "prefilled",
        url: `https://www.threads.net/intent/post?${buildQuery({ text: options.body })}`,
      };
    case "reddit": {
      const subreddit = options.target?.trim().replace(/^\/?r\//i, "");
      const base = subreddit
        ? `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/submit`
        : "https://www.reddit.com/submit";
      const title = options.title ?? "";
      const query =
        options.link && options.body.trim() === ""
          ? buildQuery({ title, url: options.link })
          : buildQuery({
              title,
              type: "TEXT",
              text:
                options.link === undefined ||
                options.body.includes(options.link)
                  ? options.body
                  : `${options.body}\n\n${options.link}`,
            });
      return { kind: "prefilled", url: `${base}?${query}` };
    }
    default:
      return {
        kind: "copy-then-open",
        url: PLATFORMS[options.platformId].composeUrl,
      };
  }
}
