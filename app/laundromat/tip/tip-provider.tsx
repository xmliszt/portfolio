"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { createTokenCode } from "@/lib/laundromat/tip/create-token-code";
import { getDropOutcome } from "@/lib/laundromat/tip/get-drop-outcome";
import { GOLDEN_CHARGE_MS } from "@/lib/laundromat/tip/golden-charge-ms";
import { hashTokenCode } from "@/lib/laundromat/tip/hash-token-code";
import { isPendingTip } from "@/lib/laundromat/tip/is-pending-tip";
import { isTipToken } from "@/lib/laundromat/tip/is-tip-token";
import { mergeTokens } from "@/lib/laundromat/tip/merge-tokens";
import type {
  CoinMachinePhase,
  JarCoin,
  OwnGoldenCharge,
  PendingTip,
  TipToken,
  TokenNotice,
} from "@/lib/laundromat/tip/tip-token";
import { wait } from "@/lib/laundromat/wait";

import { PENDING_TIPS_STORAGE_KEY } from "./pending-tips-storage-key";
import { readStoredList } from "./read-stored-list";
import {
  getTipStatus,
  loadJar,
  restoreToken as restoreTokenAction,
  spendToken as spendTokenAction,
  startTip as startTipAction,
} from "./tip-actions";
import { TipContext, type TokenRestoreResult } from "./tip-state";
import { TIP_TIMELINE_MS } from "./tip-timeline";

const TOKENS_STORAGE_KEY = "laundromat:tip-tokens";
const COIN_DROP_VIBRATION_MS = [15, 40, 25];
const POLL_MS = { fast: 1500, slow: 5000, fastForMs: 30_000 };
const TOKEN_CODE_BYTES = 10;
const PENDING_DROPS_KEY = "laundromat:pending-drops";
const SPEND_TIMEOUT_MS = 12_000;
const GOLDEN_CHARGES_KEY = "laundromat:golden-charges";
const NOTICE_MS = 3500;

type PendingDrop = { code: string; attempt: string; machineId: string };

function isPendingDrop(value: unknown): value is PendingDrop {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "string" &&
    "attempt" in value &&
    typeof value.attempt === "string" &&
    "machineId" in value &&
    typeof value.machineId === "string"
  );
}

function isGoldenCharge(value: unknown): value is OwnGoldenCharge {
  return (
    typeof value === "object" &&
    value !== null &&
    "machineId" in value &&
    typeof value.machineId === "string" &&
    "attempt" in value &&
    typeof value.attempt === "string" &&
    "startedAt" in value &&
    typeof value.startedAt === "number" &&
    (!("ranAt" in value) ||
      value.ranAt === undefined ||
      typeof value.ranAt === "number")
  );
}

function readStoredCharges() {
  return readStoredList({ key: GOLDEN_CHARGES_KEY, isItem: isGoldenCharge });
}

function readChargesFromStorage() {
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(GOLDEN_CHARGES_KEY) ?? "[]"
    );
    return Array.isArray(stored) ? stored.filter(isGoldenCharge) : [];
  } catch {
    return undefined;
  }
}

function readPendingDrops() {
  return readStoredList({ key: PENDING_DROPS_KEY, isItem: isPendingDrop });
}

function forgetPendingDrop(code: string) {
  writeStoredList({
    key: PENDING_DROPS_KEY,
    items: readPendingDrops().filter((drop) => drop.code !== code),
  });
}

function withTimeout<Value>(options: { promise: Promise<Value>; ms: number }) {
  return Promise.race([
    options.promise,
    new Promise<never>((_, reject) =>
      window.setTimeout(() => reject(new Error("timeout")), options.ms)
    ),
  ]);
}

function writeStoredList(options: { key: string; items: unknown[] }) {
  try {
    window.localStorage.setItem(options.key, JSON.stringify(options.items));
  } catch {}
}

function readPendingTips() {
  return readStoredList({
    key: PENDING_TIPS_STORAGE_KEY,
    isItem: isPendingTip,
  });
}

function readStoredTokens() {
  return readStoredList({ key: TOKENS_STORAGE_KEY, isItem: isTipToken });
}

function forgetPendingTip(sessionId: string) {
  writeStoredList({
    key: PENDING_TIPS_STORAGE_KEY,
    items: readPendingTips().filter((tip) => tip.sessionId !== sessionId),
  });
}

type TipProviderProps = { children: React.ReactNode };

/** Provide the visitor's tip tokens, the jar's coins and the coin machine's phase to the scene and the toolbar, open and settle real tips through Stripe whether or not the panel stays open (resuming any still pending from an earlier visit), hold one token until it is dropped into a washer or dryer, which spends it on the server (safe to retry after a lost answer) and gives that machine a golden charge kept across reloads, and show what happened to the drop. */
export function TipProvider(props: TipProviderProps) {
  const [tokens, setTokens] = useState<TipToken[]>();
  const [jar, setJar] = useState<JarCoin[]>();
  const [machine, setMachine] = useState<CoinMachinePhase>({ kind: "idle" });
  const [heldTokenCode, holdToken] = useState<string>();
  const [goldenCharges, setGoldenCharges] = useState<OwnGoldenCharge[]>([]);
  const settlingDropsRef = useRef<{
    [attempt: string]: Promise<ReturnType<typeof getDropOutcome>> | undefined;
  }>({});
  const [tokenNotice, setTokenNotice] = useState<TokenNotice>();
  const timersRef = useRef<number[]>([]);
  const settlingRef = useRef<{
    [sessionId: string]: Promise<TipToken | undefined>;
  }>({});
  const isActiveRef = useRef(false);
  const startedTipsRef = useRef<{ [sessionId: string]: PendingTip }>({});
  const sound = useSoundBoard();
  const soundRef = useRef(sound);
  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useEffect(() => {
    setTokens(readStoredTokens());
    void loadJar()
      .catch(() => undefined)
      .then(setJar);
    function handleStorage(event: StorageEvent) {
      if (event.key !== TOKENS_STORAGE_KEY) return;
      setTokens((current = []) => mergeTokens([current, readStoredTokens()]));
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const storeToken = useCallback((token: TipToken) => {
    const stored = mergeTokens([readStoredTokens(), [token]]);
    writeStoredList({ key: TOKENS_STORAGE_KEY, items: stored });
    return stored;
  }, []);

  const keepToken = useCallback(
    (token: TipToken) => {
      const stored = storeToken(token);
      setTokens((current = []) => mergeTokens([current, stored]));
    },
    [storeToken]
  );

  const setTimer = useCallback((options: { run: () => void; ms: number }) => {
    const timer = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((id) => id !== timer);
      options.run();
    }, options.ms);
    timersRef.current = [...timersRef.current, timer];
  }, []);

  const takeToken = useCallback(() => setMachine({ kind: "idle" }), []);

  const startTip = useCallback(async (options: { cents: number }) => {
    const code = createTokenCode(
      crypto.getRandomValues(new Uint8Array(TOKEN_CODE_BYTES))
    );
    const result = await startTipAction({
      cents: options.cents,
      tokenHash: await hashTokenCode(code),
    });
    if (result.kind === "started") {
      startedTipsRef.current[result.sessionId] = {
        sessionId: result.sessionId,
        code,
        cents: options.cents,
      };
    }
    return result;
  }, []);

  const rememberTip = useCallback((options: { sessionId: string }) => {
    const started = startedTipsRef.current[options.sessionId];
    if (started === undefined) return;
    writeStoredList({
      key: PENDING_TIPS_STORAGE_KEY,
      items: [
        ...readPendingTips().filter(
          ({ sessionId }) => sessionId !== options.sessionId
        ),
        started,
      ],
    });
  }, []);

  const dispenseToken = useCallback(
    async (token: TipToken) => {
      setMachine({ kind: "inserting" });
      sound?.play("coin-insert");
      navigator.vibrate?.(COIN_DROP_VIBRATION_MS);
      await wait(TIP_TIMELINE_MS.insert);
      setMachine({ kind: "dispensing" });
      sound?.play("token-drop");
      setTimer({
        run: () => {
          setJar((coins = []) =>
            coins.some(({ number }) => number === token.number)
              ? coins
              : [...coins, { number: token.number, createdAt: token.createdAt }]
          );
          sound?.play("jar-coin");
        },
        ms: TIP_TIMELINE_MS.jarDropDelay,
      });
      await wait(TIP_TIMELINE_MS.dispense);
      setMachine({ kind: "token-in-tray" });
      sound?.play("tip-chime");
    },
    [sound, setTimer]
  );

  const findPendingTip = useCallback(
    (sessionId: string) =>
      readPendingTips().find((tip) => tip.sessionId === sessionId) ??
      startedTipsRef.current[sessionId],
    []
  );

  const settleTip = useCallback(
    (options: { sessionId: string }) => {
      const { sessionId } = options;
      const settling = settlingRef.current[sessionId];
      if (settling !== undefined) return settling;
      const startedAt = Date.now();
      const promise = (async (): Promise<TipToken | undefined> => {
        while (isActiveRef.current) {
          const status = await getTipStatus({ sessionId }).catch(
            () => ({ kind: "pending" }) as const
          );
          if (status.kind === "unavailable") return undefined;
          if (status.kind === "expired" || status.kind === "failed") {
            forgetPendingTip(sessionId);
            return undefined;
          }
          if (status.kind === "paid") {
            const pending = findPendingTip(sessionId);
            if (pending === undefined) {
              const settledElsewhere = readStoredTokens().find(
                ({ number }) => number === status.coin.number
              );
              if (settledElsewhere !== undefined) keepToken(settledElsewhere);
              return settledElsewhere;
            }
            const token = { ...status.coin, code: pending.code };
            storeToken(token);
            forgetPendingTip(sessionId);
            await dispenseToken(token);
            keepToken(token);
            return token;
          }
          await wait(
            Date.now() - startedAt < POLL_MS.fastForMs
              ? POLL_MS.fast
              : POLL_MS.slow
          );
        }
        return undefined;
      })().finally(() => {
        delete settlingRef.current[sessionId];
      });
      settlingRef.current[sessionId] = promise;
      return promise;
    },
    [dispenseToken, findPendingTip, keepToken, storeToken]
  );

  useEffect(() => {
    isActiveRef.current = true;
    readPendingTips().forEach(({ sessionId }) => void settleTip({ sessionId }));
    return () => {
      isActiveRef.current = false;
    };
  }, [settleTip]);

  const restoreToken = useCallback(
    async (options: { code: string }) => {
      const result = await restoreTokenAction(options);
      if (result.kind !== "restored") return result;
      const token = { ...result.coin, code: options.code };
      keepToken(token);
      return { kind: "restored", token } satisfies TokenRestoreResult;
    },
    [keepToken]
  );

  const showNotice = useCallback(
    (notice: TokenNotice | undefined) => {
      setTokenNotice(notice);
      if (notice === undefined || notice.kind === "checking") return;
      setTimer({
        run: () =>
          setTokenNotice((current) =>
            current === notice ? undefined : current
          ),
        ms: NOTICE_MS,
      });
    },
    [setTimer]
  );

  const updateCharges = useCallback(
    (change: (charges: OwnGoldenCharge[]) => OwnGoldenCharge[]) => {
      setGoldenCharges((current) => {
        const next = change(readChargesFromStorage() ?? current);
        writeStoredList({ key: GOLDEN_CHARGES_KEY, items: next });
        return next;
      });
    },
    []
  );

  const chargeMachine = useCallback(
    (options: { machineId: string; attempt: string }) => {
      soundRef.current?.play("coin-insert");
      soundRef.current?.play("start-button");
      soundRef.current?.play("tip-chime");
      updateCharges((charges) => [
        ...charges.filter((charge) => charge.machineId !== options.machineId),
        {
          machineId: options.machineId,
          attempt: options.attempt,
          startedAt: Date.now(),
        },
      ]);
    },
    [updateCharges]
  );

  const settleDrop = useCallback(
    (drop: PendingDrop) => {
      const settling = settlingDropsRef.current[drop.attempt];
      if (settling !== undefined) return settling;
      const promise = (async () => {
        const result = await withTimeout({
          promise: spendTokenAction(drop),
          ms: SPEND_TIMEOUT_MS,
        }).catch(() => ({ kind: "unavailable" }) as const);
        const outcome = getDropOutcome(result);
        const held = readStoredTokens().find(({ code }) => code === drop.code);
        if (held !== undefined && outcome.spentAt !== undefined) {
          keepToken({ ...held, spentAt: outcome.spentAt });
        }
        if (!outcome.retry) forgetPendingDrop(drop.code);
        if (outcome.charge) chargeMachine(drop);
        return outcome;
      })().finally(() => {
        delete settlingDropsRef.current[drop.attempt];
      });
      settlingDropsRef.current[drop.attempt] = promise;
      return promise;
    },
    [keepToken, chargeMachine]
  );

  const dropToken = useCallback(
    async (options: { machineId: string }) => {
      if (heldTokenCode === undefined) return;
      const stored = readPendingDrops().find(
        ({ code }) => code === heldTokenCode
      );
      if (
        stored !== undefined &&
        settlingDropsRef.current[stored.attempt] !== undefined
      ) {
        return;
      }
      const drop = {
        code: heldTokenCode,
        attempt: stored?.attempt ?? crypto.randomUUID(),
        machineId: options.machineId,
      };
      writeStoredList({
        key: PENDING_DROPS_KEY,
        items: [
          ...readPendingDrops().filter(({ code }) => code !== drop.code),
          drop,
        ],
      });
      showNotice({ kind: "checking" });
      const outcome = await settleDrop(drop);
      showNotice(outcome.notice);
      if (!outcome.retry) holdToken(undefined);
      if (!outcome.charge) sound?.play("door-locked");
    },
    [heldTokenCode, settleDrop, showNotice, sound]
  );

  const settleDropRef = useRef(settleDrop);
  useEffect(() => {
    settleDropRef.current = settleDrop;
  }, [settleDrop]);
  useEffect(() => {
    readPendingDrops().forEach((drop) => void settleDropRef.current(drop));
  }, []);

  const applyChargeChanges = useCallback(
    (changes: { ran: string[]; ended: string[] }) => {
      if (changes.ran.length === 0 && changes.ended.length === 0) return;
      const ranAt = Date.now();
      updateCharges((charges) =>
        charges
          .filter(({ machineId }) => !changes.ended.includes(machineId))
          .map((charge) =>
            changes.ran.includes(charge.machineId)
              ? { ...charge, ranAt }
              : charge
          )
      );
    },
    [updateCharges]
  );

  useEffect(() => {
    setGoldenCharges(readStoredCharges());
    function handleStorage(event: StorageEvent) {
      if (event.key === GOLDEN_CHARGES_KEY) {
        setGoldenCharges(readStoredCharges());
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(
    () => () =>
      timersRef.current.forEach((timer) => window.clearTimeout(timer)),
    []
  );

  const value = useMemo(
    () => ({
      tokens: tokens ?? [],
      jar,
      machine,
      startTip,
      rememberTip,
      findPendingTip,
      settleTip,
      restoreToken,
      takeToken,
      heldTokenCode,
      holdToken,
      dropToken,
      goldenCharges,
      applyChargeChanges,
      tokenNotice,
    }),
    [
      tokens,
      jar,
      machine,
      startTip,
      rememberTip,
      findPendingTip,
      settleTip,
      restoreToken,
      takeToken,
      heldTokenCode,
      dropToken,
      goldenCharges,
      applyChargeChanges,
      tokenNotice,
    ]
  );

  return (
    <TipContext.Provider value={value}>{props.children}</TipContext.Provider>
  );
}
