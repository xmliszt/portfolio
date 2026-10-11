import "server-only";

import { createHmac } from "node:crypto";

type SignVisitorIdOptions = {
  visitorId: string;
  secret: string;
};

/**
 * Return the cookie value `<visitorId>.<signature>`, where the signature is a base64url HMAC-SHA256 of `visitorId` with `secret`.
 */
export function signVisitorId(options: SignVisitorIdOptions) {
  const signature = createHmac("sha256", options.secret)
    .update(options.visitorId)
    .digest("base64url");

  return `${options.visitorId}.${signature}`;
}
