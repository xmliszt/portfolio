"use server";

import { headers } from "next/headers";

import { readOrCreateVisitorCookieId } from "@/app/laundromat/read-or-create-visitor-cookie-id";
import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";
import { recordVisit } from "@/lib/laundromat/supabase/record-visit";
import { parseVisitInput } from "@/lib/laundromat/visit/parse-visit-input";

/** Count a visit for today by the visitor in the signed cookie, creating the cookie on first visit and, once the cookie already existed, moving rows recorded under `legacyVisitorId` to it, with the country from Vercel's IP header and the host of `referrer`; does nothing outside Vercel production, for a malformed locale, or when the database or visitor secret is not configured, and logs a database error. */
export async function recordLaundromatVisit(options: {
  legacyVisitorId: string;
  locale: string;
  referrer: string;
}) {
  if (process.env.VERCEL_ENV !== "production") return;
  const visit = parseVisitInput({
    ...options,
    countryHeader: (await headers()).get("x-vercel-ip-country"),
  });
  const client = createLaundromatServiceClient();
  const secret = process.env.LAUNDROMAT_VISITOR_SECRET;
  if (visit === undefined || client === undefined || !secret) return;
  try {
    const { visitorId, isNew } = await readOrCreateVisitorCookieId(secret);
    await recordVisit({
      client,
      ...visit,
      visitorId,
      legacyVisitorId: isNew ? undefined : visit.legacyVisitorId,
    });
  } catch (error) {
    console.error("Failed to record laundromat visit", error);
  }
}
