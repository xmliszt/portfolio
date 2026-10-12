"use client";

import { useEffect, useState } from "react";

import type { RoomRegion } from "@/lib/laundromat/realtime/room-presence";

import { getVisitorRegion } from "./get-visitor-region";

/** Return the visitor's rough `region` once the server has looked it up while `enabled`, `undefined` until then and when it is unknown, and whether the lookup `isSettled`, found or not. */
export function useVisitorRegion(options: { enabled: boolean }) {
  const [region, setRegion] = useState<RoomRegion>();
  const [isSettled, setIsSettled] = useState(false);
  useEffect(() => {
    if (!options.enabled) return;
    const request = { isCurrent: true };
    getVisitorRegion()
      .then((found) => {
        if (request.isCurrent) setRegion(found);
      })
      .catch(() => undefined)
      .finally(() => {
        if (request.isCurrent) setIsSettled(true);
      });
    return () => {
      request.isCurrent = false;
    };
  }, [options.enabled]);
  return { region, isSettled };
}
