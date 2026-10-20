import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { METAL_TONES } from "@/lib/laundromat/tip/tip-coin-metals";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const TINT_OPACITY = 0.16;

type GoldenMachineGlowProps = {
  faces: { front: ScreenPoint[]; side: ScreenPoint[]; top: ScreenPoint[] };
  halo: boolean;
};

/** Draw a gold tint over a machine's front, side and top faces with a gold outline, and a soft outer glow when `halo`. */
export function GoldenMachineGlow(props: GoldenMachineGlowProps) {
  const { light, base } = METAL_TONES.brass;
  return (
    <g
      pointerEvents="none"
      style={{
        filter: props.halo ? `drop-shadow(0 0 6px ${base})` : undefined,
      }}
    >
      {[props.faces.front, props.faces.side, props.faces.top].map(
        (face, index) => (
          <polygon
            key={index}
            points={toSvgPoints(face)}
            fill={light}
            fillOpacity={TINT_OPACITY}
            stroke={base}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        )
      )}
    </g>
  );
}
