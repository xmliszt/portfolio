"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { GoldenWash } from "@/lib/laundromat/realtime/room-presence";
import { GOLDEN_WASH_MS } from "@/lib/laundromat/tip/golden-wash-ms";
import { isTipToken } from "@/lib/laundromat/tip/is-tip-token";
import type {
  CoinMachinePhase,
  JarCoin,
  TipToken,
} from "@/lib/laundromat/tip/tip-token";
import { wait } from "@/lib/laundromat/wait";

import { createFakeTipService } from "./create-fake-tip-service";
import { TipContext } from "./tip-state";
import { TIP_TIMELINE_MS } from "./tip-timeline";

const TOKENS_STORAGE_KEY = "laundromat:tip-tokens";
const COIN_DROP_VIBRATION_MS = [15, 40, 25];

function readStoredTokens(): TipToken[] {
  try {
    const stored: unknown = JSON.parse(
      window.localStorage.getItem(TOKENS_STORAGE_KEY) ?? "[]"
    );
    return Array.isArray(stored) ? stored.filter(isTipToken) : [];
  } catch {
    return [];
  }
}

type TipProviderProps = { children: React.ReactNode };

/** Provide the visitor's tip tokens, the jar's coins and the coin machine's phase to the scene and the toolbar, run a paid tip through to its token whether or not the panel stays open, and hold one token until it is dropped into a washer for a golden wash, as often as the visitor likes. */
export function TipProvider(props: TipProviderProps) {
  const [service] = useState(createFakeTipService);
  const [tokens, setTokens] = useState<TipToken[]>();
  const [jar, setJar] = useState<JarCoin[]>();
  const [machine, setMachine] = useState<CoinMachinePhase>({ kind: "idle" });
  const [heldTokenCode, holdToken] = useState<string>();
  const [goldenWashes, setGoldenWashes] = useState<GoldenWash[]>([]);
  const goldenWashTimersRef = useRef<number[]>([]);
  const sound = useSoundBoard();

  useEffect(() => {
    setTokens(readStoredTokens());
    void service.loadJar().then(setJar);
  }, [service]);

  useEffect(() => {
    if (tokens === undefined) return;
    try {
      window.localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens));
    } catch {}
  }, [tokens]);

  const keepToken = useCallback((token: TipToken) => {
    setTokens((current = []) =>
      [...current.filter(({ code }) => code !== token.code), token].toSorted(
        (a, b) => b.number - a.number
      )
    );
  }, []);

  const takeToken = useCallback(() => setMachine({ kind: "idle" }), []);

  const completeTip = useCallback(
    async (options: { sessionId: string }) => {
      const token = await service.claimTip(options);
      setMachine({ kind: "inserting" });
      sound?.play("coin-insert");
      navigator.vibrate?.(COIN_DROP_VIBRATION_MS);
      await wait(TIP_TIMELINE_MS.insert);
      setMachine({ kind: "dispensing" });
      sound?.play("token-drop");
      window.setTimeout(() => {
        setJar((coins = []) => [
          ...coins,
          { number: token.number, createdAt: token.createdAt },
        ]);
        sound?.play("jar-coin");
      }, TIP_TIMELINE_MS.jarDropDelay);
      await wait(TIP_TIMELINE_MS.dispense);
      setMachine({ kind: "token-in-tray" });
      keepToken(token);
      sound?.play("tip-chime");
      return token;
    },
    [service, sound, keepToken]
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
      const timer = window.setTimeout(() => {
        setGoldenWashes((washes) => washes.filter((w) => w !== wash));
        goldenWashTimersRef.current = goldenWashTimersRef.current.filter(
          (id) => id !== timer
        );
      }, GOLDEN_WASH_MS);
      goldenWashTimersRef.current = [...goldenWashTimersRef.current, timer];
    },
    [heldTokenCode, sound]
  );

  useEffect(
    () => () =>
      goldenWashTimersRef.current.forEach((timer) =>
        window.clearTimeout(timer)
      ),
    []
  );

  const value = useMemo(
    () => ({
      service,
      tokens: tokens ?? [],
      jar,
      machine,
      completeTip,
      keepToken,
      takeToken,
      heldTokenCode,
      holdToken,
      dropToken,
      goldenWashes,
    }),
    [
      service,
      tokens,
      jar,
      machine,
      completeTip,
      keepToken,
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
