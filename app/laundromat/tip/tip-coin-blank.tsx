import { useId } from "react";

import { COIN_LIGHT } from "@/lib/laundromat/tip/coin-light";
import { getCoinTones } from "@/lib/laundromat/tip/get-coin-tones";
import type {
  MetalTones,
  TipCoinMetal,
} from "@/lib/laundromat/tip/tip-coin-metals";
import { cn } from "@/lib/utils";

const RIM_RADIUS = 43.5;
const RELIEFS = {
  cut: { blur: 0.35, depth: -1.8 },
  fineCut: { blur: 0.12, depth: -0.9 },
  raise: { blur: 0.35, depth: 2.2 },
};

export type CoinSheen = "static" | "follow" | "track" | "glint" | "none";

type TipCoinBlankProps = {
  metal: TipCoinMetal;
  sizePx: number;
  rimText: string | undefined;
  relief?: boolean;
  sheen: CoinSheen;
  raised: boolean;
  dim?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLSpanElement>;
  children: (tones: {
    field: MetalTones;
    rimPathId: string;
    cutFilter: string | undefined;
    fineCutFilter: string | undefined;
    raiseFilter: string | undefined;
  }) => React.ReactNode;
};

/** Draw one face of a struck metal coin: a reeded, brushed rim, a recessed field, `rimText` around the rim, and whatever `children` draws into a 100 × 100 SVG over the field, with lit filters for cut and raised lettering when `relief`; the sheen moves with the `--sheen-x` custom property when `follow`, easing after it, or `track`, at once, or sweeps across every few seconds from `--glint-delay` when `glint`, and the coin casts its edge and shadow below it when `raised`. */
export function TipCoinBlank(props: TipCoinBlankProps) {
  const { ref, ...coin } = props;
  const id = useId().replaceAll(":", "");
  const { ring, field } = getCoinTones(coin.metal);
  const thicknessPx = Math.max(1.5, coin.sizePx * 0.045);
  function filterUrl(kind: keyof typeof RELIEFS) {
    return coin.relief === true ? `url(#${id}-${kind})` : undefined;
  }
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
            d={`M 50 50 m -${RIM_RADIUS} 0 a ${RIM_RADIUS} ${RIM_RADIUS} 0 1 1 ${RIM_RADIUS * 2} 0 a ${RIM_RADIUS} ${RIM_RADIUS} 0 1 1 -${RIM_RADIUS * 2} 0`}
          />
        </defs>
        {coin.relief === true &&
          (["cut", "fineCut", "raise"] as const).map((kind) => (
            <filter
              key={kind}
              id={`${id}-${kind}`}
              filterUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={100}
              height={100}
            >
              <feGaussianBlur
                in="SourceAlpha"
                stdDeviation={RELIEFS[kind].blur}
                result="height"
              />
              <feDiffuseLighting
                in="height"
                surfaceScale={RELIEFS[kind].depth}
                diffuseConstant={1}
                lightingColor="#ffffff"
                result="shade"
              >
                <feDistantLight
                  data-coin-light
                  azimuth={COIN_LIGHT.azimuthDeg}
                  elevation={COIN_LIGHT.elevationDeg}
                />
              </feDiffuseLighting>
              <feSpecularLighting
                in="height"
                surfaceScale={RELIEFS[kind].depth}
                specularConstant={1.1}
                specularExponent={20}
                lightingColor={field.light}
                result="glint"
              >
                <feDistantLight
                  data-coin-light
                  azimuth={COIN_LIGHT.azimuthDeg}
                  elevation={COIN_LIGHT.elevationDeg}
                />
              </feSpecularLighting>
              <feComposite
                in="SourceGraphic"
                in2="shade"
                operator="arithmetic"
                k1={1}
                result="shaded"
              />
              <feComposite
                in="glint"
                in2="SourceAlpha"
                operator="in"
                result="glintInside"
              />
              <feComposite
                in="shaded"
                in2="glintInside"
                operator="arithmetic"
                k2={1}
                k3={0.8}
              />
            </filter>
          ))}
        {coin.rimText !== undefined && (
          <text
            className="font-[family-name:var(--lm-font-mono)] uppercase"
            fontSize={6.4}
            letterSpacing={1.2}
            fill={ring.edge}
            opacity={coin.relief === true ? 0.9 : 0.75}
            filter={filterUrl("fineCut")}
          >
            <textPath
              href={`#${id}-rim`}
              textLength={2 * Math.PI * RIM_RADIUS}
              lengthAdjust="spacing"
            >
              {coin.rimText}
            </textPath>
          </text>
        )}
        {coin.children({
          field,
          rimPathId: `${id}-rim`,
          cutFilter: filterUrl("cut"),
          fineCutFilter: filterUrl("fineCut"),
          raiseFilter: filterUrl("raise"),
        })}
      </svg>
      {coin.sheen !== "none" && (
        <span
          className={cn(
            "pointer-events-none absolute inset-0 rounded-full mix-blend-soft-light",
            coin.sheen === "static"
              ? "bg-[linear-gradient(135deg,rgb(255_255_255/0.5),transparent_45%)]"
              : "bg-[linear-gradient(110deg,transparent_30%,rgb(255_255_255/0.9)_48%,transparent_66%)] bg-[length:260%_100%] [background-position:var(--sheen-x,120%)_0]",
            coin.sheen === "follow" &&
              "transition-[background-position] duration-500 ease-out",
            coin.sheen === "glint" &&
              "animate-coin-glint [animation-delay:var(--glint-delay,0s)]"
          )}
        />
      )}
    </span>
  );
}
