"use client";

import { AnimatePresence, motion } from "motion/react";

const SWAP_S = 0.18;
const SWAP_SCALE = 0.98;

type TipSwapProps = {
  swapKey: string;
  reducedMotion: boolean;
  children: React.ReactNode;
};

/** Cross-fade `children` out and back in whenever `swapKey` changes, with a slight scale unless `reducedMotion`. */
export function TipSwap(props: TipSwapProps) {
  const hidden = props.reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, scale: SWAP_SCALE };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={props.swapKey}
        initial={hidden}
        animate={{ opacity: 1, scale: 1 }}
        exit={hidden}
        transition={{ duration: SWAP_S, ease: "easeOut" }}
      >
        {props.children}
      </motion.div>
    </AnimatePresence>
  );
}
