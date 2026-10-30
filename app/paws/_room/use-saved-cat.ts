"use client";

import { useEffect, useState } from "react";

import { fetchSavedCat } from "@/app/paws/_ui/fetch-saved-cat";
import type { SavedCat } from "@/lib/paws/cat-api-types";
import type { PawsSession } from "@/lib/paws/session-types";

/** Return the signed-in member's saved cat (loaded once per account, `undefined` until found or for guests) and a setter for a cat just made. */
export function useSavedCat(session: PawsSession) {
  const [savedCat, setSavedCat] = useState<SavedCat | undefined>(undefined);
  const memberId = session.kind === "member" ? session.userId : undefined;
  const accessToken =
    session.kind === "member" ? session.accessToken : undefined;

  useEffect(() => {
    if (memberId === undefined || accessToken === undefined) return;
    const controller = new AbortController();
    void fetchSavedCat({ accessToken, signal: controller.signal }).then(
      (answer) => {
        if (answer.kind === "found") setSavedCat(answer.cat);
      }
    );
    return () => {
      controller.abort();
      setSavedCat(undefined);
    };
    // The token refreshes every hour; the cat only needs loading once per account.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  return { savedCat, setSavedCat };
}
