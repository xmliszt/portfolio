import { useId } from "react";

import { METAL_TONES } from "@/lib/laundromat/tip/tip-coin-metals";

const GLOW_OPACITY = 0.85;
const FADE_IN_S = 0.8;

type GoldenWashGlowProps = { radius: number };

/** Draw a brass disc of `radius` around the origin that fades in over `FADE_IN_S`. */
export function GoldenWashGlow(props: GoldenWashGlowProps) {
  const gradientId = useId();
  const { light, base, dark } = METAL_TONES.brass;
  return (
    <g
      data-lm-motion
      style={{ animation: `lm-gold-in ${FADE_IN_S}s ease-out` }}
    >
      <defs>
        <radialGradient id={gradientId} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" stopColor={light} />
          <stop offset="0.45" stopColor={base} />
          <stop offset="1" stopColor={dark} />
        </radialGradient>
      </defs>
      <circle
        r={props.radius}
        fill={`url(#${gradientId})`}
        opacity={GLOW_OPACITY}
      />
    </g>
  );
}
