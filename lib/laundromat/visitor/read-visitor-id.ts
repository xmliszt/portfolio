import "server-only";

import { timingSafeEqual } from "node:crypto";

import { signVisitorId } from "@/lib/laundromat/visitor/sign-visitor-id";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

type ReadVisitorIdOptions = {
  cookieValue: string | undefined;
  secret: string;
};

/**
 * Return the visitor id from a cookie value made by `signVisitorId`, or `undefined` when it is missing, malformed or its signature does not match `secret`.
 */
export function readVisitorId(options: ReadVisitorIdOptions) {
  const visitorId = options.cookieValue?.split(".").at(0);
  if (!options.cookieValue || !visitorId || !UUID_PATTERN.test(visitorId)) {
    return undefined;
  }

  const expected = Buffer.from(
    signVisitorId({ visitorId, secret: options.secret })
  );
  const actual = Buffer.from(options.cookieValue);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return undefined;
  }

  return visitorId;
}
