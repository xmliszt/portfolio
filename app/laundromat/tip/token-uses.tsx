"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { cn } from "@/lib/utils";

const PIP_CLASSES = {
  paper: {
    left: "shadow-[inset_0_0_0_1px_rgb(43_38_32/0.55)]",
    used: "bg-[#151617] shadow-[inset_0_1px_1.5px_#000]",
  },
  panel: {
    left: "bg-[var(--lm-accent-hi)] shadow-[0_0_5px_color-mix(in_oklab,var(--lm-accent)_70%,transparent)]",
    used: "shadow-[inset_0_0_0_1px_var(--lm-line)]",
  },
};

type TokenUsesProps = {
  uses: number;
  usesLeft: number;
  tone: "paper" | "panel";
  className?: string;
};

/** Show how many of a token's `uses` are left as a row of pips beside the count: on `paper`, a punch card with a hole for each use spent; on `panel`, a lit pip for each use left. */
export function TokenUses(props: TokenUsesProps) {
  const { copy } = useLaundromatCopy();
  const pips = PIP_CLASSES[props.tone];
  return (
    <span
      className={cn(
        "flex flex-wrap items-center justify-between gap-x-3 gap-y-1",
        props.className
      )}
    >
      <span>
        {copy.tip.usesLeft({ left: props.usesLeft, total: props.uses })}
      </span>
      <span aria-hidden className="flex flex-wrap gap-x-1 gap-y-1">
        {Array.from({ length: props.uses }, (_, index) => (
          <span
            key={index}
            className={cn(
              "size-1.5 rounded-full",
              index < props.usesLeft ? pips.left : pips.used
            )}
          />
        ))}
      </span>
    </span>
  );
}
