"use client";

import type { ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { motion, useTransform } from "motion/react";

import { getPageRadius } from "./get-page-radius";

type PageLeafProps = {
  angle: MotionValue<number>;
  curlStrength: number;
  front: ReactNode;
  back: ReactNode;
  hidden: boolean;
  pageWidth: number;
};

const FACE_CLASS =
  "absolute inset-0 overflow-hidden [backface-visibility:hidden]";

export function PageLeaf(props: PageLeafProps) {
  const transform = useTransform(
    props.angle,
    (angle) => `rotateY(${angle}deg)`
  );
  const bend = useTransform(props.angle, (angle) =>
    Math.sin((Math.abs(angle) / 180) * Math.PI)
  );
  const shade = useTransform(bend, (value) => value * props.curlStrength);
  const sheen = useTransform(
    props.angle,
    (angle) =>
      `linear-gradient(to left, rgb(0 0 0 / 0.28), rgb(255 255 255 / 0.18) ${20 + (Math.abs(angle) / 180) * 50}%, transparent 85%)`
  );
  const backSheen = useTransform(
    props.angle,
    (angle) =>
      `linear-gradient(to right, rgb(0 0 0 / 0.28), rgb(255 255 255 / 0.14) ${70 - (Math.abs(angle) / 180) * 50}%, transparent 90%)`
  );

  return (
    <motion.div
      aria-hidden
      className="absolute top-0 h-full origin-left [transform-style:preserve-3d]"
      style={{
        left: props.pageWidth,
        width: props.pageWidth,
        transform,
        opacity: props.hidden ? 0 : 1,
      }}
    >
      <div
        className={FACE_CLASS}
        style={{ borderRadius: getPageRadius("right") }}
      >
        {props.front}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: sheen, opacity: shade }}
        />
      </div>
      <div
        className={`${FACE_CLASS} [transform:rotateY(180deg)]`}
        style={{ borderRadius: getPageRadius("left") }}
      >
        {props.back}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: backSheen, opacity: shade }}
        />
      </div>
    </motion.div>
  );
}
