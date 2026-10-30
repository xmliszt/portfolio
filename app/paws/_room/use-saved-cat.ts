"use client";

import { useEffect, useRef, useState } from "react";

import { fetchSavedCat } from "@/app/paws/_ui/fetch-saved-cat";
import type { SavedCat } from "@/lib/paws/cat-api-types";
import type { PawsSession } from "@/lib/paws/session-types";

const RETRY_DELAY_MS = 3000;

/** Return the signed-in member's saved cat (loaded once per account and retried until the server answers, `undefined` until found or for guests), whether the lookup is done (`true` at once for guests), and a setter for a cat just made. */
export function useSavedCat(session: PawsSession) {
  const [savedCat, setSavedCat] = useState<SavedCat | undefined>(undefined);
  const [checkedFor, setCheckedFor] = useState<string | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const memberId = session.kind === "member" ? session.userId : undefined;
  const accessToken =
    session.kind === "member" ? session.accessToken : undefined;
  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    const accessToken = tokenRef.current;
    if (memberId === undefined || accessToken === undefined) return;
    const controller = new AbortController();
    const retry: { timer?: number } = {};
    void fetchSavedCat({ accessToken, signal: controller.signal }).then(
      (answer) => {
        if (controller.signal.aborted) return;
        if (answer.kind === "unreachable") {
          retry.timer = window.setTimeout(
            () => setAttempt((value) => value + 1),
            RETRY_DELAY_MS
          );
          return;
        }
        if (answer.kind === "found") setSavedCat(answer.cat);
        setCheckedFor(memberId);
      }
    );
    return () => {
      controller.abort();
      window.clearTimeout(retry.timer);
      setSavedCat(undefined);
    };
  }, [memberId, attempt]);

  const isChecked =
    session.kind === "guest" ||
    (memberId !== undefined && checkedFor === memberId);
  return { savedCat, setSavedCat, isChecked };
}
