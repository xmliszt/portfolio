import { useId } from "react";

import { getCoinTones } from "@/lib/laundromat/tip/get-coin-tones";
import type {
  MetalTones,
  TipCoinMetal,
} from "@/lib/laundromat/tip/tip-coin-metals";
import { cn } from "@/lib/utils";

const RIM_TEXT = "laundro.cafe · thank you · laundro.cafe · thank you · ";

export type CoinSheen = "static" | "follow" | "track" | "none";

type TipCoinBlankProps = {
  metal: TipCoinMetal;
  sizePx: number;
  engraved: boolean;
  sheen: CoinSheen;
  raised: boolean;
  dim?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
  children: (tones: {
    field: MetalTones;
    rimPathId: string;
  }) => React.ReactNode;
};

/** Draw one face of a struck metal coin: a reeded, brushed rim, a recessed field, `RIM_TEXT` around the rim when `engraved`, and whatever `children` draws into a 100 × 100 SVG over the field; the sheen moves with the `--sheen-x` custom property when `follow`, easing after it, or `track`, at once, and the coin casts its edge and shadow below it when `raised`. */
export function TipCoinBlank(props: TipCoinBlankProps) {
  const { ref, ...coin } = props;
  const id = useId().replaceAll(":", "");
  const { ring, field } = getCoinTones(coin.metal);
  const thicknessPx = Math.max(1.5, coin.sizePx * 0.045);
  const raisedShadow = coin.raised
    ? `0 ${thicknessPx}px 0 ${ring.edge}, 0 ${thicknessPx * 2}px ${thicknessPx * 4}px rgb(0 0 0 / 0.55), `
    : "";
  return (
    <span
      ref={ref}
      className={cn(
        "relative block size-full rounded-full",
        coin.dim === true && "brightness-[0.8] saturate-[0.55]",
        coin.className
      )}
      style={{
        background: `conic-gradient(from 200deg, ${ring.light}, ${ring.base} 18%, ${ring.dark} 32%, ${ring.base} 46%, ${ring.light} 58%, ${ring.base} 72%, ${ring.dark} 86%, ${ring.light})`,
        boxShadow: `${raisedShadow}inset 0 1px 0 rgb(255 255 255 / 0.55), inset 0 -1px 1px rgb(0 0 0 / 0.35)`,
        ...coin.style,
      }}
    >
      <span
        className="absolute inset-0 rounded-full opacity-60 [mask:radial-gradient(circle,transparent_calc(50%-3px),#000_calc(50%-2.5px))]"
        style={{
          background: `repeating-conic-gradient(${ring.dark} 0 1.2deg, transparent 1.2deg 4deg)`,
        }}
      />
      <span
        className="absolute inset-[13%] rounded-full"
        style={{
          background: `radial-gradient(circle at 34% 28%, ${field.light}, ${field.base} 46%, ${field.dark} 100%)`,
          boxShadow: `inset 0 ${thicknessPx}px ${thicknessPx * 1.5}px rgb(0 0 0 / 0.45), inset 0 -1px 0 rgb(255 255 255 / 0.4), 0 0 0 1px ${field.dark}`,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 size-full overflow-visible"
      >
        <defs>
          <path
            id={`${id}-rim`}
            d="M 50 50 m -43.5 0 a 43.5 43.5 0 1 1 87 0 a 43.5 43.5 0 1 1 -87 0"
          />
        </defs>
        {coin.engraved && (
          <text
            className="font-[family-name:var(--lm-font-mono)] uppercase"
            fontSize={6.4}
            letterSpacing={1.2}
            fill={ring.edge}
            opacity={0.75}
          >
            <textPath href={`#${id}-rim`}>{RIM_TEXT}</textPath>
          </text>
        )}
        {coin.children({ field, rimPathId: `${id}-rim` })}
      </svg>
      {coin.sheen !== "none" && (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full mix-blend-soft-light",
            coin.sheen === "static"
              ? "bg-[linear-gradient(135deg,rgb(255_255_255/0.5),transparent_45%)]"
              : "bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.9)_48%,transparent_66%)] bg-[length:260%_100%] [background-position:var(--sheen-x,120%)_0]",
            coin.sheen === "follow" &&
              "transition-[background-position] duration-500 ease-out"
          )}
        />
      )}
    </span>
  );
}
