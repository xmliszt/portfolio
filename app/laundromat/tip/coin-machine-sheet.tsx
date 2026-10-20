"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { cn } from "@/lib/utils";

import type { CoinPanelStep } from "./coin-machine-panel";
import { CoinMachinePanel } from "./coin-machine-panel";
import { TIP_PANEL_CLASS } from "./tip-classes";
import type { TipState } from "./tip-state";

export const COIN_PANEL_WIDTH_PX = 372;
export const COIN_PANEL_GUTTER_PX = 20;
export const COIN_SHEET_ROOM_SHARE = 0.46;

const EASE = [0.23, 1, 0.32, 1] as const;
const SLIDE_S = 0.32;
const PANEL_OFFSET_PX = 24;

type CoinMachineSheetProps = {
  tip: TipState;
  narrow: boolean;
  reducedMotion: boolean;
  restoreCode: string | undefined;
  resumeSessionId: string | undefined;
  onClose: () => void;
  onBusyChange: (isBusy: boolean) => void;
};

/** Hold the coin machine panel beside the zoomed-in machine: a panel at the right edge on wide screens, a bottom sheet on phones that slides away while the coin drops so the machine stays in view. */
export function CoinMachineSheet(props: CoinMachineSheetProps) {
  const { copy } = useLaundromatCopy();
  const [step, setStep] = useState<CoinPanelStep>(
    props.restoreCode === undefined ? { kind: "pick" } : { kind: "restore" }
  );
  const isHiddenOnPhone =
    props.narrow &&
    step.kind === "waiting" &&
    (props.tip.machine.kind === "inserting" ||
      props.tip.machine.kind === "dispensing");
  const offset = props.reducedMotion
    ? {}
    : props.narrow
      ? { y: "100%" }
      : { x: PANEL_OFFSET_PX };

  const panel = (
    <CoinMachinePanel
      tip={props.tip}
      step={step}
      restoreCode={props.restoreCode}
      resumeSessionId={props.resumeSessionId}
      onStepChange={setStep}
      onBusyChange={props.onBusyChange}
      onClose={props.onClose}
    />
  );

  if (props.narrow) {
    return (
      <AnimatePresence>
        {!isHiddenOnPhone && (
          <motion.div
            key="sheet"
            data-coin-panel
            role="dialog"
            aria-label={copy.tip.dialogLabel}
            className={cn(
              TIP_PANEL_CLASS,
              "absolute inset-x-0 bottom-0 z-40 rounded-t-[22px] pb-[max(0.5rem,env(safe-area-inset-bottom))]",
              step.kind === "checkout"
                ? "max-h-[92dvh]"
                : step.kind === "pick"
                  ? "max-h-[54dvh]"
                  : "max-h-[80dvh]"
            )}
            initial={{ opacity: 0, ...offset }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, ...offset }}
            transition={{ duration: SLIDE_S, ease: EASE }}
          >
            {panel}
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-40 flex items-center"
      style={{
        right: `max(${COIN_PANEL_GUTTER_PX}px, env(safe-area-inset-right))`,
      }}
    >
      <motion.div
        data-coin-panel
        role="dialog"
        aria-label={copy.tip.dialogLabel}
        className={cn(
          TIP_PANEL_CLASS,
          "pointer-events-auto max-h-[calc(100dvh-40px)] rounded-[22px]"
        )}
        style={{ width: COIN_PANEL_WIDTH_PX }}
        initial={{ opacity: 0, ...offset }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, ...offset }}
        transition={{ duration: SLIDE_S, ease: EASE }}
      >
        {panel}
      </motion.div>
    </div>
  );
}
