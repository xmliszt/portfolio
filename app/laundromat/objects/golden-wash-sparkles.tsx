import { METAL_TONES } from "@/lib/laundromat/tip/tip-coin-metals";

const SPARKLES = [
  { angleDeg: -60, distanceRatio: 1.25, sizePx: 3.2, delayS: 0 },
  { angleDeg: 15, distanceRatio: 1.35, sizePx: 2.4, delayS: 0.7 },
  { angleDeg: 120, distanceRatio: 1.2, sizePx: 2.8, delayS: 0.35 },
  { angleDeg: 200, distanceRatio: 1.3, sizePx: 2, delayS: 1.1 },
  { angleDeg: -10, distanceRatio: 0.45, sizePx: 2.2, delayS: 0.5 },
  { angleDeg: 160, distanceRatio: 0.5, sizePx: 1.8, delayS: 0.9 },
];
const TWINKLE_S = 1.6;

function getStarPath(sizePx: number) {
  const waist = sizePx * 0.22;
  return `M 0 ${-sizePx} Q ${waist} ${-waist} ${sizePx} 0 Q ${waist} ${waist} 0 ${sizePx} Q ${-waist} ${waist} ${-sizePx} 0 Q ${-waist} ${-waist} 0 ${-sizePx} Z`;
}

type GoldenWashSparklesProps = {
  center: { x: number; y: number };
  radius: number;
  animated: boolean;
};

/** Draw four-point stars in and around a washer door of `radius` at `center`, twinkling in turn when `animated` and holding still otherwise. */
export function GoldenWashSparkles(props: GoldenWashSparklesProps) {
  return (
    <g pointerEvents="none" fill={METAL_TONES.brass.light}>
      {SPARKLES.map((sparkle) => {
        const angle = (sparkle.angleDeg * Math.PI) / 180;
        const distance = props.radius * sparkle.distanceRatio;
        return (
          <g
            key={sparkle.angleDeg}
            transform={`translate(${props.center.x + Math.cos(angle) * distance} ${props.center.y + Math.sin(angle) * distance})`}
          >
            <path
              data-lm-motion
              d={getStarPath(sparkle.sizePx)}
              opacity={0.8}
              style={
                props.animated
                  ? {
                      animation: `lm-twinkle ${TWINKLE_S}s ease-in-out ${sparkle.delayS}s infinite both`,
                    }
                  : undefined
              }
            />
          </g>
        );
      })}
    </g>
  );
}
