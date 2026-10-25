"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { PRINTER_KEY_CLASS } from "@/app/laundromat/settings/printer-key-class";
import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import { cn } from "@/lib/utils";

import { CloseKey } from "./close-key";
import { TIP_FACEPLATE_CLASS, TIP_HEADING_CLASS } from "./tip-classes";
import { TipCoin } from "./tip-coin";
import { TipCoinCloseUp } from "./tip-coin-close-up";
import { TipModal } from "./tip-modal";
import type { TipState } from "./tip-state";
import { TipSwap } from "./tip-swap";

const COIN_SIZE_PX = 40;
const STAGGER_S = 0.012;
const MAX_STAGGERED = 30;
const COIN_SPRING = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.2,
} as const;
const DROP_IN_PX = 6;
const GLINT_STAGGER_S = 0.7;
const GLINT_CYCLE_S = 3.6;

type TipJarTrayProps = {
  tip: TipState;
  open: boolean;
  onClose: () => void;
  onLeaveTip: () => void;
};

/** Spread every coin in the tip jar on a tray, newest first, with this visitor's own coins in brass, glinting while they have uses left, each opening its coin up close, a hint to tap them under the tray while any has uses left, and what a tip gets with a key that calls `onLeaveTip`. */
export function TipJarTray(props: TipJarTrayProps) {
  const { copy } = useLaundromatCopy();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [viewingCode, setViewingCode] = useState<string>();
  const [lastViewedCode, setLastViewedCode] = useState<string>();
  const leaveCloseUp = useCallback(() => setViewingCode(undefined), []);
  const coins = (props.tip.jar ?? []).toReversed().map((coin) => ({
    coin,
    own: props.tip.tokens.find(
      ({ number, createdAt }) =>
        number === coin.number && createdAt === coin.createdAt
    ),
  }));
  const unspentOwnNumbers = coins.flatMap(({ coin, own }) =>
    own !== undefined && own.usesLeft > 0 ? [coin.number] : []
  );
  const viewing = props.tip.tokens.find(({ code }) => code === viewingCode);
  const { onClose } = props;
  const close = useCallback(() => {
    setViewingCode(undefined);
    onClose();
  }, [onClose]);
  return (
    <TipModal
      open={props.open}
      labelledBy="tip-jar-heading"
      onClose={viewing === undefined ? close : leaveCloseUp}
    >
      <div className={TIP_FACEPLATE_CLASS}>
        <TipSwap
          swapKey={viewing?.code ?? "tray"}
          reducedMotion={prefersReducedMotion}
        >
          {viewing === undefined ? (
            <div className="flex flex-col gap-y-4">
              <div className="flex items-start justify-between gap-x-3">
                <div className="flex flex-col gap-y-1">
                  <h2 id="tip-jar-heading" className={TIP_HEADING_CLASS}>
                    {copy.tip.trayHeading}
                  </h2>
                  <span className={cn(SETTINGS_META_CLASS, "opacity-60")}>
                    {copy.tip.traySummary({
                      count: coins.length,
                      isShining: unspentOwnNumbers.length > 0,
                    })}
                  </span>
                </div>
                <CloseKey onClose={close} />
              </div>
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(40px,1fr))] justify-items-center gap-x-1.5 gap-y-2 rounded-[14px] bg-[linear-gradient(180deg,var(--lm-well),var(--lm-panel))] p-3 shadow-[inset_0_2px_6px_rgb(0_0_0/0.85),0_1px_0_rgb(255_255_255/0.04)]">
                {coins.map(({ coin, own }, index) => {
                  const date = formatTipDate({
                    isoDate: coin.createdAt,
                    locale: copy.locale,
                  });
                  const label = copy.tip.trayCoinLabel({
                    number: coin.number,
                    date,
                    isOwn: own !== undefined,
                  });
                  const glintIndex = unspentOwnNumbers.indexOf(coin.number);
                  const face = (
                    <TipCoin
                      metal={own === undefined ? "silver" : "brass"}
                      label={String(coin.number)}
                      sizePx={COIN_SIZE_PX}
                      glint={glintIndex !== -1}
                      dim={glintIndex === -1}
                      style={
                        glintIndex === -1
                          ? undefined
                          : {
                              "--glint-delay": `${(glintIndex * GLINT_STAGGER_S) % GLINT_CYCLE_S}s`,
                            }
                      }
                    />
                  );
                  return (
                    <motion.li
                      key={coin.number}
                      title={date}
                      aria-label={own === undefined ? label : undefined}
                      initial={
                        prefersReducedMotion
                          ? false
                          : { opacity: 0, y: -DROP_IN_PX }
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        ...COIN_SPRING,
                        delay: Math.min(index, MAX_STAGGERED) * STAGGER_S,
                      }}
                    >
                      {own === undefined ? (
                        face
                      ) : (
                        <button
                          type="button"
                          aria-label={label}
                          className={cn(
                            "block cursor-zoom-in rounded-full outline-none focus-visible:shadow-[0_0_0_2px_var(--lm-well),0_0_0_3.5px_var(--lm-accent)]",
                            own.usesLeft > 0 &&
                              "shadow-[0_0_10px_2px_rgb(255_190_90/0.28)]"
                          )}
                          autoFocus={own.code === lastViewedCode}
                          onClick={() => {
                            setViewingCode(own.code);
                            setLastViewedCode(own.code);
                          }}
                        >
                          {face}
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
              {unspentOwnNumbers.length > 0 && (
                <p
                  className={cn(
                    SETTINGS_META_CLASS,
                    "m-0 text-center normal-case opacity-60"
                  )}
                >
                  {copy.tip.trayHint}
                </p>
              )}
              <div className="flex flex-col gap-y-2">
                <p
                  className={cn(
                    SETTINGS_META_CLASS,
                    "m-0 text-center text-pretty normal-case opacity-60"
                  )}
                >
                  {copy.tip.trayPitch}
                </p>
                <button
                  type="button"
                  className={cn(
                    PRINTER_KEY_CLASS,
                    "h-10 w-full justify-center px-3"
                  )}
                  onClick={props.onLeaveTip}
                >
                  <TipCoin metal="brass" label="" sizePx={14} />
                  {copy.tip.trayLeaveTip}
                </button>
              </div>
            </div>
          ) : (
            <TipCoinCloseUp
              token={viewing}
              headingId="tip-jar-heading"
              onBack={leaveCloseUp}
              onClose={close}
            />
          )}
        </TipSwap>
      </div>
    </TipModal>
  );
}
