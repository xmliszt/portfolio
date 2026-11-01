const MAX_PREFILL_URL_LENGTH = 7_500;

type ChatgptUrl =
  | { kind: "prefilled"; url: string }
  | { kind: "copy-then-open"; url: string };

/** Return a ChatGPT URL prefilled with `prompt`, or the bare ChatGPT URL when the prompt makes the URL too long. */
export function buildChatgptUrl(options: { prompt: string }): ChatgptUrl {
  const url = `https://chatgpt.com/?q=${encodeURIComponent(options.prompt)}`;
  return url.length <= MAX_PREFILL_URL_LENGTH
    ? { kind: "prefilled", url }
    : { kind: "copy-then-open", url: "https://chatgpt.com/" };
}
