"use client";

import { AnimatePresence, motion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { formatTipDate } from "@/lib/laundromat/tip/format-tip-date";
import type { TokenNotice } from "@/lib/laundromat/tip/tip-token";

import { CloseKey } from "./close-key";
import { TipCoin } from "./tip-coin";

const HINT_SPRING = {
  type: "spring",
  visualDuration: 0.3,
  bounce: 0.15,
} as const;

type TokenHintProps = {
  held: boolean;
  notice: TokenNotice | undefined;
  reducedMotion: boolean;
  onCancel: () => void;
};

/** Show, while `held` or while there is a `notice`, a note at the bottom of the room: that the token is in hand and a washer or dryer will take it, or what happened to the drop, with a key that calls `onCancel`. */
export function TokenHint(props: TokenHintProps) {
  const { copy } = useLaundromatCopy();
  const text = (() => {
    switch (props.notice?.kind) {
      case undefined:
        return copy.tip.holdHint;
      case "checking":
        return copy.tip.screen.checking;
      case "used":
        return copy.tip.usedOn({
          date: formatTipDate({
            isoDate: props.notice.spentAt,
            locale: copy.locale,
          }),
        });
      case "unknown":
        return copy.tip.screen.notFound;
      case "offline":
        return copy.tip.screen.offline;
      default: {
        const unhandled: never = props.notice;
        return unhandled;
      }
    }
  })();
  const offscreen = props.reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 16 };
  return (
    <AnimatePresence>
      {(props.held || props.notice !== undefined) && (
        <motion.div
          data-token-hint
          role="status"
          className="absolute inset-x-0 bottom-[max(24px,env(safe-area-inset-bottom))] flex justify-center px-4"
          initial={offscreen}
          animate={{ opacity: 1, y: 0 }}
          exit={offscreen}
          transition={HINT_SPRING}
        >
          <div className="flex items-center gap-x-3 rounded-[12px] bg-[var(--lm-panel)] py-1.5 pr-1.5 pl-3 text-[13px] text-[var(--lm-ink-hi)] lowercase shadow-[inset_0_0_0_1px_var(--lm-edge),0_12px_32px_rgb(0_0_0/0.5)]">
            <TipCoin metal="brass" label="" sizePx={18} />
            {text}
            <CloseKey onClose={props.onCancel} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
