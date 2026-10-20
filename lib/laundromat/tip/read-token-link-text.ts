import { TOKEN_CODE_HASH_PREFIX } from "./token-code-format";

/** Return the text after `#token=` in `hash`, decoded when it is valid percent-encoding and left as typed when it is not, or `""` when `hash` is not a token link. */
export function readTokenLinkText(hash: string) {
  if (!hash.startsWith(TOKEN_CODE_HASH_PREFIX)) return "";
  const raw = hash.slice(TOKEN_CODE_HASH_PREFIX.length);
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}
