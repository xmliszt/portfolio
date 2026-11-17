import { useId, useMemo } from "react";

import { CylinderSides } from "@/app/laundromat/objects/cylinder-sides";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { getChristmasTreeShape } from "@/lib/laundromat/decorations/get-christmas-tree-shape";
import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { useDecorationPose } from "./use-decoration-pose";

type ChristmasTreeDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "christmas-tree" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function ChristmasTreeDrawing(props: ChristmasTreeDrawingProps) {
  const { pose, progress, reducedMotion } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const id = useId();
  const { quality } = useRenderQuality();
  const shape = useMemo(
    () =>
      getChristmasTreeShape({
        object: props.object,
        projection: props.projection,
      }),
    [props.object, props.projection]
  );
  const { needle, bauble, gold, snow, bulb, bulbGlow, twinkleSeconds } =
    props.details;
  const needles = getColorShades(needle);
  const stand = getColorShades(props.object.potted ? bauble : "#6b4a33");
  const baubleColors = [bauble, gold, snow];
  const isChasing = pose > 0;
  const sway = reducedMotion
    ? 0
    : Math.sin(progress * Math.PI * 5) *
      (1 - progress) *
      props.reactionSettings.strength *
      1.6;
  const bulbCount = shape.bulbs.length;
  function bulbOpacity(index: number) {
    if (!isChasing) return bulbGlow;
    if (reducedMotion) return 1;
    const wave = (progress * 3 - index / bulbCount + 1) % 1;
    return wave < 0.22 ? 1 : 0.3;
  }
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={isChasing ? "active" : "idle"}
      stroke="none"
    >
      <defs>
        <radialGradient id={`${id}-bulb`}>
          <stop stopColor="#fff8e0" />
          <stop offset="0.45" stopColor={bulb} />
          <stop offset="1" stopColor={bulb} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-bauble`} cx="0.35" cy="0.3" r="0.75">
          <stop stopColor="#fff" stopOpacity="0.7" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </radialGradient>
      </defs>
      <g className="stroke-[var(--lm-line)]" strokeWidth={0.75}>
        <path d={shape.stand.body} fill={stand[1]} />
        {shape.stand.facets.map((facet) => (
          <polygon
            key={facet.shade}
            points={toSvgPoints(facet.points)}
            fill={stand[3 - facet.shade]}
            stroke="none"
          />
        ))}
        <ellipse
          cx={shape.stand.top.cx}
          cy={shape.stand.top.cy}
          rx={shape.stand.top.rx}
          ry={shape.stand.top.ry}
          fill={stand[0]}
        />
      </g>
      <g className="stroke-[var(--lm-line)]" strokeWidth={0.6}>
        <CylinderSides body={shape.trunk.body} facets={shape.trunk.facets} />
      </g>
      <g
        style={{
          transformOrigin: `${shape.base.x}px ${shape.base.y}px`,
          transform: sway === 0 ? undefined : `rotate(${sway}deg)`,
        }}
      >
        {shape.tiers.map((tier, tierIndex) => (
          <g key={tierIndex}>
            <polygon points={tier.lit} fill={needles[1]} />
            <polygon points={tier.shaded} fill={needles[2]} />
            <path
              d={tier.edge}
              fill="none"
              stroke={needles[3]}
              strokeWidth={0.9}
              strokeLinejoin="round"
            />
            {tier.baubles.map((item, index) => (
              <g key={index}>
                <line
                  x1={item.at.x}
                  y1={item.at.y - shape.baubleRadius * 1.9}
                  x2={item.at.x}
                  y2={item.at.y - shape.baubleRadius}
                  stroke={gold}
                  strokeWidth={0.5}
                />
                <circle
                  cx={item.at.x}
                  cy={item.at.y}
                  r={shape.baubleRadius}
                  fill={baubleColors[item.color]}
                />
                <circle
                  cx={item.at.x}
                  cy={item.at.y}
                  r={shape.baubleRadius}
                  fill={`url(#${id}-bauble)`}
                />
              </g>
            ))}
            <polyline
              points={toSvgPoints(tier.bulbs)}
              fill="none"
              stroke={needles[3]}
              strokeWidth={0.45}
            />
            {tier.bulbs.map((point, place) => {
              const index = tierIndex * tier.bulbs.length + place;
              return (
                <g key={index} opacity={bulbOpacity(index)}>
                  <g
                    className={
                      quality === "full" && !isChasing
                        ? "lm-bulb-twinkle"
                        : undefined
                    }
                    style={{
                      animationDuration: `${twinkleSeconds}s`,
                      animationDelay: `${-((index * 0.37) % 1) * twinkleSeconds}s`,
                    }}
                  >
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={shape.bulbRadius * 3.2}
                      fill={`url(#${id}-bulb)`}
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={shape.bulbRadius}
                      fill="#fff6dc"
                    />
                  </g>
                </g>
              );
            })}
          </g>
        ))}
        <circle
          cx={shape.starCenter.x}
          cy={shape.starCenter.y}
          r={shape.starRadius * 2}
          fill={`url(#${id}-bulb)`}
          opacity={isChasing ? 0.9 : bulbGlow * 0.6}
        />
        <polygon
          points={shape.star}
          fill={gold}
          stroke={`color-mix(in srgb, ${gold} 60%, #3a2410)`}
          strokeWidth={0.6}
          strokeLinejoin="round"
        />
      </g>
      <style>{`@keyframes lm-bulb-twinkle { 0%, 100% { opacity: 1; } 40% { opacity: .55; } 70% { opacity: .9; } } @media (prefers-reduced-motion: no-preference) { .lm-bulb-twinkle { animation: lm-bulb-twinkle 2.8s ease-in-out infinite; } }`}</style>
    </g>
  );
}
