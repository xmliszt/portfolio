import { useId } from "react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

const SWAG_WIDTH = 1.1;
const NEEDLES_PER_SWAG = 14;
const BULBS_PER_SWAG = 4;

type GarlandDrawingProps = {
  object: Extract<SceneDecoration, { kind: "garland" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function GarlandDrawing(props: GarlandDrawingProps) {
  const id = useId();
  const { quality } = useRenderQuality();
  const { position, size } = props.object;
  const { unit } = props.projection;
  const { needle, bauble, gold, bulb, bulbGlow, twinkleSeconds } =
    props.details;
  const needles = getColorShades(needle);
  const face = getFacePlane({
    plane: "front",
    origin: { ...position, y: position.y + size.d, z: position.z + size.h },
    projection: props.projection,
  });
  const width = size.w * unit;
  const sag = size.h * unit * 0.7;
  const swagCount = Math.max(1, Math.round(size.w / SWAG_WIDTH));
  const swagWidth = width / swagCount;
  const thickness = Math.max(3, unit * 0.13);
  const swags = Array.from({ length: swagCount }, (_, index) => {
    const from = index * swagWidth;
    function at(t: number) {
      return {
        x: from + swagWidth * t,
        y: thickness * 0.5 + sag * 4 * t * (1 - t),
      };
    }
    return {
      from,
      d: `M${from},${thickness * 0.5} Q${from + swagWidth / 2},${thickness * 0.5 + sag * 2} ${from + swagWidth},${thickness * 0.5}`,
      needles: Array.from({ length: NEEDLES_PER_SWAG }, (_, step) => {
        const point = at((step + 0.5) / NEEDLES_PER_SWAG);
        const lean = step % 2 === 0 ? -1 : 1;
        return {
          x1: point.x - lean * thickness * 0.35,
          y1: point.y - thickness * 0.45,
          x2: point.x + lean * thickness * 0.35,
          y2: point.y + thickness * 0.45,
        };
      }),
      bulbs: Array.from({ length: BULBS_PER_SWAG }, (_, step) => {
        const point = at((step + 0.5) / BULBS_PER_SWAG);
        return { x: point.x, y: point.y + thickness * 0.55 };
      }),
    };
  });
  const joins = Array.from({ length: swagCount + 1 }, (_, index) => ({
    x: index * swagWidth,
    y: thickness * 0.5,
  }));
  return (
    <g
      data-lm-decoration={props.object.id}
      transform={face.transform}
      strokeLinecap="round"
    >
      <defs>
        <radialGradient id={`${id}-bulb`}>
          <stop stopColor="#fff8e0" />
          <stop offset="0.45" stopColor={bulb} />
          <stop offset="1" stopColor={bulb} stopOpacity="0" />
        </radialGradient>
      </defs>
      {swags.map((swag) => (
        <g key={swag.from}>
          <path
            d={swag.d}
            fill="none"
            stroke={needles[3]}
            strokeWidth={thickness}
          />
          <path
            d={swag.d}
            fill="none"
            stroke={needles[1]}
            strokeWidth={thickness * 0.6}
            transform={`translate(0 ${-thickness * 0.15})`}
          />
          <g stroke={needles[0]} strokeWidth={0.7}>
            {swag.needles.map((line, index) => (
              <line key={index} {...line} />
            ))}
          </g>
          {swag.bulbs.map((point, index) => (
            <g key={index} opacity={bulbGlow}>
              <g
                className={quality === "full" ? "lm-bulb-twinkle" : undefined}
                style={{
                  animationDuration: `${twinkleSeconds}s`,
                  animationDelay: `${-(((swag.from / swagWidth) * 0.53 + index * 0.31) % 1) * twinkleSeconds}s`,
                }}
              >
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={thickness * 0.85}
                  fill={`url(#${id}-bulb)`}
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={thickness * 0.24}
                  fill="#fff6dc"
                />
              </g>
            </g>
          ))}
        </g>
      ))}
      {joins.map((point, index) => (
        <g key={index}>
          <path
            d={`M${point.x},${point.y} l${-thickness * 0.9},${-thickness * 0.55} l0,${thickness * 1.1}Z M${point.x},${point.y} l${thickness * 0.9},${-thickness * 0.55} l0,${thickness * 1.1}Z`}
            fill={bauble}
            stroke={`color-mix(in srgb, ${bauble} 60%, #10141c)`}
            strokeWidth={0.5}
            strokeLinejoin="round"
          />
          <circle cx={point.x} cy={point.y} r={thickness * 0.28} fill={gold} />
        </g>
      ))}
      <style>{`@keyframes lm-bulb-twinkle { 0%, 100% { opacity: 1; } 40% { opacity: .55; } 70% { opacity: .9; } } @media (prefers-reduced-motion: no-preference) { .lm-bulb-twinkle { animation: lm-bulb-twinkle 2.8s ease-in-out infinite; } }`}</style>
    </g>
  );
}
