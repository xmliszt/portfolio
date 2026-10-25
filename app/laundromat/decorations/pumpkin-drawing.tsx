import { useId, useMemo } from "react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { getPumpkinShape } from "@/lib/laundromat/decorations/get-pumpkin-shape";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

type PumpkinDrawingProps = {
  object: Extract<SceneDecoration, { kind: "pumpkin" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["pumpkin"];
};

export function PumpkinDrawing(props: PumpkinDrawingProps) {
  const id = useId();
  const { quality } = useRenderQuality();
  const shape = useMemo(
    () =>
      getPumpkinShape({ object: props.object, projection: props.projection }),
    [props.object, props.projection]
  );
  const { rind, stem, glow, glowIntensity, flickerSeconds } = props.details;
  const shades = [
    `color-mix(in srgb, ${rind} 80%, #ffca86)`,
    rind,
    `color-mix(in srgb, ${rind} 80%, #30202c)`,
    `color-mix(in srgb, ${rind} 60%, #211725)`,
  ];
  return (
    <g data-lm-decoration={props.object.id} stroke="none">
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="#fff0bb" />
          <stop offset="0.55" stopColor={glow} />
          <stop offset="1" stopColor={rind} />
        </radialGradient>
        <radialGradient id={`${id}-bloom`}>
          <stop stopColor={glow} stopOpacity="0.24" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
      </defs>
      {shape.facets.map((facet, index) => (
        <polygon
          key={index}
          points={facet.points}
          fill={shades[facet.shade]}
          stroke={shades[facet.shade]}
          strokeWidth="0.35"
        />
      ))}
      <g fill="none" stroke="#412a24" strokeOpacity="0.35" strokeWidth="0.65">
        {shape.ribs.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
      <polygon
        points={shape.stem}
        fill={stem}
        stroke="color-mix(in srgb, #222 60%, transparent)"
        strokeWidth="0.6"
      />
      {props.object.lantern && (
        <>
          <g fill="#21151d" stroke="#d07d37" strokeWidth="1.2">
            {shape.cutouts.map((points, index) => (
              <polygon key={index} points={points} />
            ))}
          </g>
          <g opacity={glowIntensity}>
            <g
              className={quality === "full" ? "lm-pumpkin-flame" : undefined}
              style={{ animationDuration: `${flickerSeconds}s` }}
            >
              <g fill={`url(#${id}-glow)`}>
                {shape.cutouts.map((points, index) => (
                  <polygon key={index} points={points} />
                ))}
              </g>
              <circle
                cx={shape.center.x}
                cy={shape.center.y}
                r={props.object.size.w * props.projection.unit * 0.75}
                fill={`url(#${id}-bloom)`}
              />
            </g>
          </g>
        </>
      )}
      <style>{`@keyframes lm-pumpkin-flame { 0%, 100% { opacity: 1; } 23%, 67% { opacity: .82; } 41%, 83% { opacity: .94; } } @media (prefers-reduced-motion: no-preference) { .lm-pumpkin-flame { animation: lm-pumpkin-flame 3.7s ease-in-out infinite; } }`}</style>
    </g>
  );
}
