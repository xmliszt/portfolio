import "server-only";

import { cookies } from "next/headers";

import { readVisitorId } from "@/lib/laundromat/visitor/read-visitor-id";

import { VISITOR_COOKIE } from "./visitor-cookie";

/** Return the visitor id from the signed `laundromat_visitor` cookie, or `undefined` when it is missing or invalid; never sets the cookie. */
export async function readVisitorCookieId(secret: string) {
  const cookieStore = await cookies();
  return readVisitorId({
    cookieValue: cookieStore.get(VISITOR_COOKIE)?.value,
    secret,
  });
}
