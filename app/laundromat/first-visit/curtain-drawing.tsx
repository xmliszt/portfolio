import { useId, useState } from "react";
import type { MotionValue } from "motion/react";
import { useMotionValueEvent } from "motion/react";

import { IsoBox } from "@/app/laundromat/objects/iso-box";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { BedroomWindowLight } from "@/lib/laundromat/first-visit/get-bedroom-window-light";
import { getCurtainFolds } from "@/lib/laundromat/first-visit/get-curtain-folds";
import type { getCurtainLayout } from "@/lib/laundromat/first-visit/get-curtain-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { RenderQuality } from "@/lib/laundromat/render-quality/render-quality";
import type { IsoPoint } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import type { CurtainPose } from "./use-curtain-pose";

const ROD = { overhang: 0.44, bracket: 0.06, finial: 0.045, ring: 0.035 };
const HEADER_TAPE = 0.1;
const HEM_BAND = 0.08;
const DEEP_PLEAT_SLOPE = 0.8;
const BACKLIGHT = {
  peak: 0.55,
  valley: 0.5,
  foldEdge: 0.3,
  edgeFade: 0.22,
  softenPx: 5,
  margin: 40,
  warp: { frequency: "0.01 0.012", octaves: 2, seed: 7, scalePx: 3.5 },
  blurPx: 1.4,
};

type CurtainDrawingProps = {
  pose: MotionValue<CurtainPose>;
  layout: ReturnType<typeof getCurtainLayout>;
  curtain: BedroomConfig["curtain"];
  projection: IsoProjection;
  light: BedroomWindowLight | undefined;
  tier: RenderQuality;
  highlighted: boolean;
};

/** Draw the curtain rod, its rings and the two pleated panels in `pose`, with `light` glowing through the cloth where it covers the glass, brightest mid-facet and dimmer where the folds turn away. On the `"full"` tier the glow is softened and warped by noise. */
export function CurtainDrawing(props: CurtainDrawingProps) {
  const id = useId();
  const { layout, curtain, projection, light } = props;
  const { opening, openingWidth, rodX } = layout;
  const [pose, setPose] = useState(props.pose.get());
  useMotionValueEvent(props.pose, "change", setPose);

  function at(point: IsoPoint) {
    return projectIsoPoint({ point, projection });
  }
  function along(column: { top: IsoPoint; bottom: IsoPoint }, drop: number) {
    const amount = drop / (layout.top - layout.bottom);
    return {
      x: column.top.x + (column.bottom.x - column.top.x) * amount,
      y: column.top.y + (column.bottom.y - column.top.y) * amount,
      z: column.top.z + (column.bottom.z - column.top.z) * amount,
    };
  }
  function onRod(point: IsoPoint) {
    return at({ ...point, x: rodX });
  }

  const rodPlane = getFacePlane({
    plane: "side",
    origin: { x: rodX, y: opening.far, z: layout.top },
    projection,
  });
  const rodEnds = [
    { faceX: -ROD.overhang, outward: -1 },
    { faceX: openingWidth + ROD.overhang, outward: 1 },
  ] as const;
  const panels = (["near", "far"] as const).map((end) => ({
    end,
    folds: getCurtainFolds({
      rings: pose.rings,
      hem: pose.hem,
      layout,
      stackOutset: curtain.stackOutset,
      fabric: curtain.fabricPerGap,
      end,
    }),
  }));
  const glass = [
    { y: opening.near, z: opening.top },
    { y: opening.far, z: opening.top },
    { y: opening.far, z: opening.bottom },
    { y: opening.near, z: opening.bottom },
  ].map((corner) => at({ x: rodX, ...corner }));
  const glassPlane = getFacePlane({
    plane: "side",
    origin: { x: rodX, y: opening.far, z: opening.top },
    projection,
  });
  const paneHeight = opening.top - opening.bottom;
  const glassBounds = {
    left: Math.min(...glass.map((point) => point.x)) - BACKLIGHT.margin,
    top: Math.min(...glass.map((point) => point.y)) - BACKLIGHT.margin,
    right: Math.max(...glass.map((point) => point.x)) + BACKLIGHT.margin,
    bottom: Math.max(...glass.map((point) => point.y)) + BACKLIGHT.margin,
  };
  const isFull = props.tier === "full";

  return (
    <g data-curtain strokeLinejoin="round">
      {light !== undefined && (
        <defs>
          <linearGradient id={`${id}-fall`} x1={0} y1={0} x2={0} y2={1}>
            {[
              { offset: 0, opacity: 0 },
              { offset: 0.16, opacity: 1 },
              { offset: 0.6, opacity: 0.8 },
              { offset: 0.84, opacity: 0.45 },
              { offset: 1, opacity: 0 },
            ].map((stop) => (
              <stop
                key={stop.offset}
                offset={stop.offset}
                stopColor="white"
                stopOpacity={stop.opacity}
              />
            ))}
          </linearGradient>
          <filter
            id={`${id}-soften`}
            filterUnits="userSpaceOnUse"
            x={glassBounds.left}
            y={glassBounds.top}
            width={glassBounds.right - glassBounds.left}
            height={glassBounds.bottom - glassBounds.top}
          >
            <feGaussianBlur stdDeviation={BACKLIGHT.softenPx} />
          </filter>
          <mask
            id={`${id}-glass`}
            maskUnits="userSpaceOnUse"
            x={glassBounds.left}
            y={glassBounds.top}
            width={glassBounds.right - glassBounds.left}
            height={glassBounds.bottom - glassBounds.top}
          >
            <g filter={isFull ? `url(#${id}-soften)` : undefined}>
              <rect
                transform={`${glassPlane.transform} scale(${projection.unit})`}
                fill={`url(#${id}-fall)`}
                y={-paneHeight * BACKLIGHT.edgeFade}
                width={openingWidth}
                height={paneHeight * (1 + 2 * BACKLIGHT.edgeFade)}
              />
            </g>
          </mask>
          {isFull && (
            <filter
              id={`${id}-diffuse`}
              filterUnits="userSpaceOnUse"
              x={glassBounds.left}
              y={glassBounds.top}
              width={glassBounds.right - glassBounds.left}
              height={glassBounds.bottom - glassBounds.top}
            >
              <feTurbulence
                type="fractalNoise"
                baseFrequency={BACKLIGHT.warp.frequency}
                numOctaves={BACKLIGHT.warp.octaves}
                seed={BACKLIGHT.warp.seed}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={BACKLIGHT.warp.scalePx}
                xChannelSelector="R"
                yChannelSelector="G"
                result="warped"
              />
              <feGaussianBlur in="warped" stdDeviation={BACKLIGHT.blurPx} />
            </filter>
          )}
        </defs>
      )}
      {rodEnds.map((end) => (
        <IsoBox
          key={end.faceX}
          position={{
            x: 0,
            y: opening.far - end.faceX - ROD.bracket / 2,
            z: layout.top - ROD.bracket / 2,
          }}
          size={{ w: rodX, d: ROD.bracket, h: ROD.bracket }}
          projection={projection}
        />
      ))}
      {panels.map(({ end, folds }) => {
        const facets = folds.slice(1).map((to, index) => {
          const from = folds[index]!;
          const fromTape = along(from, HEADER_TAPE);
          const toTape = along(to, HEADER_TAPE);
          const run = Math.max(Math.abs(to.top.y - from.top.y), 1e-4);
          const fromEdge = [at(fromTape), at(from.bottom)] as const;
          const toEdge = [at(toTape), at(to.bottom)] as const;
          return {
            key: index,
            across: {
              x1: (fromEdge[0].x + fromEdge[1].x) / 2,
              y1: 0,
              x2: (toEdge[0].x + toEdge[1].x) / 2,
              y2: 0,
            },
            facesFront: (to.top.x - from.top.x) * (from.top.y - to.top.y) > 0,
            isDeep: Math.abs(to.top.x - from.top.x) / run > DEEP_PLEAT_SLOPE,
            points: toSvgPoints([
              fromEdge[0],
              toEdge[0],
              toEdge[1],
              fromEdge[1],
            ]),
          };
        });
        return (
          <g key={end}>
            {facets.map((facet) => (
              <polygon
                key={facet.key}
                className={cn(
                  "stroke-none",
                  facet.isDeep
                    ? facet.facesFront
                      ? "fill-[var(--lm-shade-2)]"
                      : "fill-[var(--lm-wall)]"
                    : "fill-[var(--lm-shade-1)]"
                )}
                points={facet.points}
              />
            ))}
            {light !== undefined && (
              <g
                mask={`url(#${id}-glass)`}
                className="pointer-events-none"
                opacity={light.strength * BACKLIGHT.peak}
              >
                <defs>
                  {facets.map((facet) => {
                    const peak = facet.facesFront ? 1 : BACKLIGHT.valley;
                    return (
                      <linearGradient
                        key={facet.key}
                        id={`${id}-${end}-${facet.key}`}
                        gradientUnits="userSpaceOnUse"
                        {...facet.across}
                      >
                        {[
                          { offset: 0, opacity: BACKLIGHT.foldEdge },
                          { offset: 0.5, opacity: 1 },
                          { offset: 1, opacity: BACKLIGHT.foldEdge },
                        ].map((stop) => (
                          <stop
                            key={stop.offset}
                            offset={stop.offset}
                            stopColor={light.color}
                            stopOpacity={stop.opacity * peak}
                          />
                        ))}
                      </linearGradient>
                    );
                  })}
                </defs>
                <g filter={isFull ? `url(#${id}-diffuse)` : undefined}>
                  {facets.map((facet) => (
                    <polygon
                      key={facet.key}
                      fill={`url(#${id}-${end}-${facet.key})`}
                      points={facet.points}
                    />
                  ))}
                </g>
              </g>
            )}
            <g className="fill-none stroke-[var(--lm-detail)]">
              {folds.slice(1, -1).map((fold, index) => (
                <polyline
                  key={index}
                  points={toSvgPoints([
                    at(along(fold, HEADER_TAPE)),
                    at(fold.bottom),
                  ])}
                />
              ))}
              <polyline
                points={toSvgPoints(
                  folds.map((fold) =>
                    at(along(fold, layout.top - layout.bottom - HEM_BAND))
                  )
                )}
              />
            </g>
            <polygon
              className="fill-[var(--lm-shade-1)] stroke-[var(--lm-detail)]"
              points={toSvgPoints([
                ...folds.map((fold) => onRod(fold.top)),
                ...folds
                  .map((fold) => onRod(along(fold, HEADER_TAPE)))
                  .toReversed(),
              ])}
            />
            <polygon
              className={cn(
                "fill-none stroke-[var(--lm-line)] transition-[stroke] duration-300",
                props.highlighted && "stroke-[var(--lm-ink-hi)]"
              )}
              points={toSvgPoints([
                ...folds.map((fold) => onRod(fold.top)),
                ...folds.map((fold) => at(fold.bottom)).toReversed(),
              ])}
            />
          </g>
        );
      })}
      <g transform={`${rodPlane.transform} scale(${projection.unit})`}>
        <line
          className={cn(
            "stroke-[var(--lm-ink)] transition-[stroke] duration-300",
            props.highlighted && "stroke-[var(--lm-ink-hi)]"
          )}
          strokeWidth={1.4}
          x1={rodEnds[0].faceX}
          y1={0}
          x2={rodEnds[1].faceX}
          y2={0}
        />
        {panels.flatMap(({ end, folds }) =>
          folds
            .filter((fold) => fold.isRing)
            .map((fold, ring) => (
              <circle
                key={`${end}-${ring}`}
                className="fill-none stroke-[var(--lm-ink)]"
                cx={opening.far - fold.top.y}
                cy={0}
                r={ROD.ring}
              />
            ))
        )}
        {rodEnds.map((end) => (
          <circle
            key={end.faceX}
            className="fill-[var(--lm-ink)] stroke-none"
            cx={end.faceX + end.outward * ROD.finial}
            cy={0}
            r={ROD.finial}
          />
        ))}
      </g>
    </g>
  );
}
