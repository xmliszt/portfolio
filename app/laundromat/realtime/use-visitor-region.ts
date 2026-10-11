"use client";

import { useEffect, useState } from "react";

import type { RoomRegion } from "@/lib/laundromat/realtime/room-presence";

import { getVisitorRegion } from "./get-visitor-region";

/** Return the visitor's rough region once the server has looked it up while `enabled`, or `undefined` until then and when it is unknown. */
export function useVisitorRegion(options: { enabled: boolean }) {
  const [region, setRegion] = useState<RoomRegion>();
  useEffect(() => {
    if (!options.enabled) return;
    const request = { isCurrent: true };
    getVisitorRegion()
      .then((found) => {
        if (request.isCurrent) setRegion(found);
      })
      .catch(() => undefined);
    return () => {
      request.isCurrent = false;
    };
  }, [options.enabled]);
  return region;
}
