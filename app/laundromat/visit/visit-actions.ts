"use server";

import { headers } from "next/headers";

import { createLaundromatServiceClient } from "@/lib/laundromat/supabase/create-laundromat-service-client";
import { recordVisit } from "@/lib/laundromat/supabase/record-visit";
import { parseVisitInput } from "@/lib/laundromat/visit/parse-visit-input";

/** Count a visit by `visitorId` for today, with the country from Vercel's IP header and the host of `referrer`; does nothing outside Vercel production, for a malformed id or locale, or when the database is not configured, and logs a database error. */
export async function recordLaundromatVisit(options: {
  visitorId: string;
  locale: string;
  referrer: string;
}) {
  if (process.env.VERCEL_ENV !== "production") return;
  const visit = parseVisitInput({
    ...options,
    countryHeader: (await headers()).get("x-vercel-ip-country"),
  });
  const client = createLaundromatServiceClient();
  if (visit === undefined || client === undefined) return;
  try {
    await recordVisit({ client, ...visit });
  } catch (error) {
    console.error("Failed to record laundromat visit", error);
  }
}
