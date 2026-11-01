import { motion, useReducedMotion } from "motion/react";

import { getYarnColors } from "@/lib/paws/render/get-yarn-colors";

type ToyBasketIconProps = { className?: string; empty: boolean };

const WICKER = { body: "#c9a06a", weave: "#9c7448", rim: "#b0854f" };
const PAPER = { face: "#ebe6da", edge: "#cdc8bc", core: "#a8743f" };

/** Draw a woven basket with a toilet roll and two yarn balls sticking out of it, which hop out one after another when `empty` turns `true` and drop back in when it turns `false`. */
export function ToyBasketIcon(props: ToyBasketIconProps) {
  const isReduced = useReducedMotion() ?? false;
  const pink = getYarnColors("yarn-1");
  const blue = getYarnColors("yarn-2");
  function hop(order: number) {
    return {
      initial: false,
      animate: props.empty
        ? { y: isReduced ? 0 : -9, opacity: 0 }
        : { y: 0, opacity: 1 },
      transition: {
        type: "spring",
        stiffness: 420,
        damping: 26,
        delay: props.empty ? order * 0.05 : 0.08 + (2 - order) * 0.06,
      },
    } as const;
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={props.className}>
      <ellipse cx="12" cy="11.7" rx="9.4" ry="1.6" fill={WICKER.weave} />
      <motion.g {...hop(0)}>
        <rect
          x="5.2"
          y="3.2"
          width="5.6"
          height="9"
          rx="1"
          fill={PAPER.face}
          stroke={PAPER.edge}
          strokeWidth="0.6"
        />
        <ellipse cx="8" cy="3.4" rx="2.8" ry="1" fill={PAPER.edge} />
        <ellipse cx="8" cy="3.4" rx="1" ry="0.4" fill={PAPER.core} />
      </motion.g>
      <motion.g {...hop(1)}>
        <circle cx="15.6" cy="8.6" r="3.9" fill={pink.body} />
        <g
          fill="none"
          stroke={pink.strand}
          strokeWidth="0.6"
          strokeLinecap="round"
        >
          <path d="M12.4 7.4c2-1.2 4.6-1.2 6.4.2" />
          <path d="M12.2 9.4c2.2-1.4 5-1.2 7 .4" />
          <path d="M14 5.4c.6 2 .6 4.6-.4 6.6" />
        </g>
      </motion.g>
      <motion.g {...hop(2)}>
        <circle cx="11.4" cy="10.6" r="2.6" fill={blue.body} />
        <g
          fill="none"
          stroke={blue.strand}
          strokeWidth="0.5"
          strokeLinecap="round"
        >
          <path d="M9.2 10c1.4-.9 3.2-.9 4.4.1" />
          <path d="M10.4 8.4c.5 1.4.5 3.2-.2 4.4" />
        </g>
      </motion.g>
      <motion.g
        initial={false}
        animate={props.empty ? "emptied" : "filled"}
        variants={{
          emptied: { scaleY: isReduced ? 1 : [1, 0.9, 1] },
          filled: { scaleY: isReduced ? 1 : [1, 0.92, 1] },
        }}
        transition={{ duration: 0.32, delay: props.empty ? 0 : 0.2 }}
        style={{ originX: 0.5, originY: 1 }}
      >
        <path d="M2.6 11.6h18.8l-2 9.2H4.6z" fill={WICKER.body} />
        <g fill="none" stroke={WICKER.weave} strokeWidth="0.7">
          <path d="M3.4 14.6h17.2M4 17.6h16" />
          <path d="M7 11.8l-.6 9M10.4 11.8l-.2 9M13.6 11.8l.2 9M17 11.8l.6 9" />
        </g>
        <rect
          x="2"
          y="10.8"
          width="20"
          height="1.8"
          rx="0.9"
          fill={WICKER.rim}
        />
      </motion.g>
    </svg>
  );
}
