import type { ShareTargetId } from "./share-targets";

/** Return the address that opens a new post or chat on `target` with `text` and `siteUrl` filled in where the platform accepts them, or `undefined` for Mastodon until `mastodonServer` is known. */
export function getShareIntentUrl(options: {
  target: ShareTargetId;
  text: string;
  siteUrl: string;
  mastodonServer: string | undefined;
}) {
  const text = encodeURIComponent(options.text);
  const url = encodeURIComponent(options.siteUrl);
  const textWithUrl = encodeURIComponent(`${options.text}\n${options.siteUrl}`);
  switch (options.target) {
    case "instagram":
      return "https://www.instagram.com/";
    case "x":
      return `https://x.com/intent/post?text=${text}&url=${url}`;
    case "facebook":
      return "https://www.facebook.com/";
    case "threads":
      return `https://www.threads.net/intent/post?text=${textWithUrl}`;
    case "bluesky":
      return `https://bsky.app/intent/compose?text=${textWithUrl}`;
    case "mastodon":
      return options.mastodonServer === undefined
        ? undefined
        : `https://${options.mastodonServer}/share?text=${textWithUrl}`;
    case "telegram":
      return `https://t.me/share/url?url=${url}&text=${text}`;
    case "whatsapp":
      return `https://wa.me/?text=${textWithUrl}`;
    default: {
      const unhandled: never = options.target;
      return unhandled;
    }
  }
}
