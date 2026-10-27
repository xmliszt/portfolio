import "server-only";

import { cookies } from "next/headers";

import { readVisitorId } from "@/lib/laundromat/visitor/read-visitor-id";
import { signVisitorId } from "@/lib/laundromat/visitor/sign-visitor-id";

const VISITOR_COOKIE = "laundromat_visitor";
const VISITOR_COOKIE_MAX_AGE_S = 60 * 60 * 24 * 365;

/** Return the visitor id from the signed `laundromat_visitor` cookie with `isNew: false`, or set a new random one signed with `secret` and return it with `isNew: true` when the cookie is missing or invalid. */
export async function readOrCreateVisitorCookieId(secret: string) {
  const cookieStore = await cookies();
  const existing = readVisitorId({
    cookieValue: cookieStore.get(VISITOR_COOKIE)?.value,
    secret,
  });
  if (existing !== undefined) return { visitorId: existing, isNew: false };
  const visitorId = crypto.randomUUID();
  cookieStore.set(VISITOR_COOKIE, signVisitorId({ visitorId, secret }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_COOKIE_MAX_AGE_S,
    path: "/",
  });
  return { visitorId, isNew: true };
}
