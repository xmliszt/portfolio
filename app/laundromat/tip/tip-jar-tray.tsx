"use client";

import { useCallback, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { SETTINGS_META_CLASS } from "@/app/laundromat/settings/settings-meta-class";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import { tipCopy } from "@/lib/laundromat/tip/tip-copy";
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

type TipJarTrayProps = {
  tip: TipState;
  open: boolean;
  onClose: () => void;
};

/** Spread every coin in the tip jar on a tray, newest first, with this visitor's own coins in brass and shining, each opening its coin up close. */
export function TipJarTray(props: TipJarTrayProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [viewingCode, setViewingCode] = useState<string>();
  const [lastViewedCode, setLastViewedCode] = useState<string>();
  const leaveCloseUp = useCallback(() => setViewingCode(undefined), []);
  const coins = (props.tip.jar ?? []).toReversed();
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
                    {tipCopy.trayHeading}
                  </h2>
                  <span className={cn(SETTINGS_META_CLASS, "opacity-60")}>
                    {tipCopy.traySummary({ count: coins.length })}
                  </span>
                </div>
                <CloseKey onClose={close} />
              </div>
              <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(40px,1fr))] justify-items-center gap-x-1.5 gap-y-2 rounded-[14px] bg-[linear-gradient(180deg,#0d0e0f,#141516)] p-3 shadow-[inset_0_2px_6px_rgb(0_0_0/0.85),0_1px_0_rgb(255_255_255/0.04)]">
                {coins.map((coin, index) => {
                  const own = props.tip.tokens.find(
                    ({ number, createdAt }) =>
                      number === coin.number && createdAt === coin.createdAt
                  );
                  const date = formatTipDate(coin.createdAt);
                  const label = tipCopy.trayCoinLabel({
                    number: coin.number,
                    date,
                    isOwn: own !== undefined,
                  });
                  const face = (
                    <TipCoin
                      metal={own === undefined ? "silver" : "brass"}
                      label={String(coin.number)}
                      sizePx={COIN_SIZE_PX}
                      shine={own !== undefined}
                      dim={own === undefined}
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
                          className="block cursor-zoom-in rounded-full outline-none focus-visible:shadow-[0_0_0_2px_#0d0e0f,0_0_0_3.5px_var(--lm-accent)]"
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
