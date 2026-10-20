"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { GoldenWash } from "@/lib/laundromat/realtime/room-presence";
import { createTokenCode } from "@/lib/laundromat/tip/create-token-code";
import { GOLDEN_WASH_MS } from "@/lib/laundromat/tip/golden-wash-ms";
import { hashTokenCode } from "@/lib/laundromat/tip/hash-token-code";
import { isPendingTip } from "@/lib/laundromat/tip/is-pending-tip";
import { isTipToken } from "@/lib/laundromat/tip/is-tip-token";
import { mergeTokens } from "@/lib/laundromat/tip/merge-tokens";
import type {
  CoinMachinePhase,
  JarCoin,
  PendingTip,
  TipToken,
} from "@/lib/laundromat/tip/tip-token";
import { wait } from "@/lib/laundromat/wait";

import { PENDING_TIPS_STORAGE_KEY } from "./pending-tips-storage-key";
import { readStoredList } from "./read-stored-list";
import {
  getTipStatus,
  loadJar,
  restoreToken as restoreTokenAction,
  startTip as startTipAction,
} from "./tip-actions";
import { TipContext, type TokenRestoreResult } from "./tip-state";
import { TIP_TIMELINE_MS } from "./tip-timeline";

const TOKENS_STORAGE_KEY = "laundromat:tip-tokens";
const COIN_DROP_VIBRATION_MS = [15, 40, 25];
const POLL_MS = { fast: 1500, slow: 5000, fastForMs: 30_000 };
const TOKEN_CODE_BYTES = 10;

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

/** Provide the visitor's tip tokens, the jar's coins and the coin machine's phase to the scene and the toolbar, open and settle real tips through Stripe whether or not the panel stays open (resuming any still pending from an earlier visit), and hold one token until it is dropped into a washer or dryer for a golden wash, as often as the visitor likes. */
export function TipProvider(props: TipProviderProps) {
  const [tokens, setTokens] = useState<TipToken[]>();
  const [jar, setJar] = useState<JarCoin[]>();
  const [machine, setMachine] = useState<CoinMachinePhase>({ kind: "idle" });
  const [heldTokenCode, holdToken] = useState<string>();
  const [goldenWashes, setGoldenWashes] = useState<GoldenWash[]>([]);
  const timersRef = useRef<number[]>([]);
  const settlingRef = useRef<{
    [sessionId: string]: Promise<TipToken | undefined>;
  }>({});
  const isActiveRef = useRef(false);
  const startedTipsRef = useRef<{ [sessionId: string]: PendingTip }>({});
  const sound = useSoundBoard();

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

  const dropToken = useCallback(
    (options: { machineId: string }) => {
      if (heldTokenCode === undefined) return;
      holdToken(undefined);
      sound?.play("coin-insert");
      sound?.play("start-button");
      sound?.play("tip-chime");
      const wash = { machineId: options.machineId, startedAt: Date.now() };
      setGoldenWashes((washes) => [...washes, wash]);
      setTimer({
        run: () =>
          setGoldenWashes((washes) => washes.filter((w) => w !== wash)),
        ms: GOLDEN_WASH_MS,
      });
    },
    [heldTokenCode, sound, setTimer]
  );

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
      goldenWashes,
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
      goldenWashes,
    ]
  );

  return (
    <TipContext.Provider value={value}>{props.children}</TipContext.Provider>
  );
}
