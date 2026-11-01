"use client";

import { useId } from "react";

import { getYarnColors } from "@/lib/paws/render/get-yarn-colors";
import { getYarnStrands } from "@/lib/paws/render/get-yarn-strands";
import { mixHex } from "@/lib/paws/render/mix-hex";
import { TOY_ITEMS, type ToyItemId } from "@/lib/paws/sim/toy-items";

type ToyIconProps = { itemId: ToyItemId; className?: string };

/** Draw the toy `itemId` as a small icon: a toilet roll seen end on, or a yarn ball in its own colour wound as `getYarnStrands` winds it in the room. */
export function ToyIcon(props: ToyIconProps) {
  const rimId = useId();
  const clipId = useId();
  const item = TOY_ITEMS.find((candidate) => candidate.id === props.itemId);
  if (item?.kind === "roll")
    return (
      <svg viewBox="0 0 24 24" aria-hidden className={props.className}>
        <circle cx="12" cy="12" r="10" fill="#e6e1d5" stroke="#cdc8bc" />
        <circle cx="12" cy="12" r="7" fill="none" stroke="#d6d1c4" />
        <circle
          cx="12"
          cy="12"
          r="4"
          fill="none"
          stroke="#a8743f"
          strokeWidth="2"
        />
      </svg>
    );
  const colors = getYarnColors(props.itemId);
  const blurred = mixHex({ from: colors.body, to: colors.strand, amount: 0.4 });
  const lit = mixHex({ from: colors.body, to: "#ffffff", amount: 0.25 });
  const paths = getYarnStrands(props.itemId).map((strand) =>
    strand
      .map(
        ([x, y], index) =>
          `${index === 0 ? "M" : "L"}${(12 + x * 10).toFixed(2)} ${(12 + y * 10).toFixed(2)}`
      )
      .join("")
  );
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className}>
      <defs>
        <radialGradient
          id={rimId}
          cx="12"
          cy="12"
          r="10.2"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.5" stopColor={blurred} stopOpacity="0" />
          <stop offset="1" stopColor={blurred} />
        </radialGradient>
        <clipPath id={clipId}>
          <circle cx="12" cy="12" r="10" />
        </clipPath>
      </defs>
      <circle cx="12" cy="12" r="10" fill={blurred} />
      <g
        clipPath={`url(#${clipId})`}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, index) => (
          <g key={index}>
            <path d={d} stroke={colors.strand} strokeWidth="1.45" />
            <path d={d} stroke={colors.body} strokeWidth="0.85" />
            <path d={d} stroke={lit} strokeWidth="0.3" />
          </g>
        ))}
      </g>
      <circle cx="12" cy="12" r="10.2" fill={`url(#${rimId})`} />
    </svg>
  );
}
