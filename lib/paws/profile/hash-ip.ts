import { createHmac } from "node:crypto";

/** Return a hex HMAC-SHA256 of `ip` keyed with `secret`, so raw addresses are never stored. */
export function hashIp(options: { ip: string; secret: string }) {
  return createHmac("sha256", options.secret).update(options.ip).digest("hex");
}
