"use client";

import { useContext, useEffect, useRef, useState } from "react";

import { getUncheckedAttempts } from "@/lib/laundromat/realtime/get-unchecked-attempts";
import type { RoomPresence } from "@/lib/laundromat/realtime/room-presence";
import {
  type ChargeCheckResult,
  settleChargeChecks,
} from "@/lib/laundromat/realtime/settle-charge-checks";
import { MAX_CHECKED_ATTEMPTS } from "@/lib/laundromat/tip/max-checked-attempts";
import type { ChargeCheck } from "@/lib/laundromat/tip/tip-token";

import { ChargeCheckContext } from "./charge-check-context";

const RETRY_MS = 15_000;

/** Check each attempt in the `peers`' golden charges once with the nearest `ChargeCheckContext`, `MAX_CHECKED_ATTEMPTS` at a time, and return what each check found, by attempt; a failed check is asked again after `RETRY_MS`. */
export function useChargeChecks(peers: RoomPresence[]) {
  const checkCharges = useContext(ChargeCheckContext);
  const [checks, setChecks] = useState<{ [attempt: string]: ChargeCheck }>({});
  const retryTimersRef = useRef(new Set<number>());
  const uncheckedKey = getUncheckedAttempts({ peers, checks })
    .slice(0, MAX_CHECKED_ATTEMPTS)
    .join(",");

  useEffect(() => {
    if (uncheckedKey === "") return;
    const attempts = uncheckedKey.split(",");
    function settle(result: ChargeCheckResult) {
      setChecks((current) =>
        settleChargeChecks({ checks: current, attempts, result })
      );
    }
    settle({ kind: "checking" });
    checkCharges(attempts)
      .then((spends = []) => settle({ kind: "found", spends, now: Date.now() }))
      .catch(() => {
        const timer = window.setTimeout(() => {
          retryTimersRef.current.delete(timer);
          settle({ kind: "failed" });
        }, RETRY_MS);
        retryTimersRef.current.add(timer);
      });
  }, [uncheckedKey, checkCharges]);

  useEffect(() => {
    const timers = retryTimersRef.current;
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return checks;
}
