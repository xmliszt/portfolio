"use server";

import { headers } from "next/headers";

import { parseRoomRegion } from "@/lib/laundromat/realtime/parse-room-region";

/** Return the visitor's rough region from Vercel's IP location headers, rounded to whole degrees, or `undefined` off Vercel. */
export async function getVisitorRegion() {
  const requestHeaders = await headers();
  return parseRoomRegion({
    latitude: requestHeaders.get("x-vercel-ip-latitude"),
    longitude: requestHeaders.get("x-vercel-ip-longitude"),
  });
}
