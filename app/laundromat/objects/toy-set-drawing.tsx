import { useId, useRef } from "react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import type { ToyFaceTone } from "@/lib/laundromat/toy/get-toy-face-tone";
import { getToyFaceTone } from "@/lib/laundromat/toy/get-toy-face-tone";
import { getToyFlightFrame } from "@/lib/laundromat/toy/get-toy-flight-frame";
import { getToyRampSegments } from "@/lib/laundromat/toy/get-toy-ramp-segments";
import type { TrackPose } from "@/lib/laundromat/toy/get-toy-track-pose";
import { getToyTrackPose } from "@/lib/laundromat/toy/get-toy-track-pose";
import { TOY_SET } from "@/lib/laundromat/toy/toy-set-geometry";
import { TOY_TRACK_SECTIONS } from "@/lib/laundromat/toy/toy-track-sections";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";
import { ToyCarDrawing } from "./toy-car-drawing";
import { useToyFlight } from "./use-toy-flight";

const TONE_FILLS = {
  top: "fill-[var(--lm-face-top)]",
  face: "fill-[var(--lm-face)]",
  "shade-2": "fill-[var(--lm-shade-2)]",
  "shade-1": "fill-[var(--lm-shade-1)]",
  wall: "fill-[var(--lm-wall)]",
} satisfies { [tone in ToyFaceTone]: string };
const RIDE_FILLS = {
  top: "fill-[color-mix(in_srgb,var(--lm-ink-hi)_30%,var(--lm-face-top))]",
  face: "fill-[color-mix(in_srgb,var(--lm-ink-hi)_24%,var(--lm-face))]",
  "shade-2": "fill-[color-mix(in_srgb,var(--lm-ink-hi)_20%,var(--lm-face))]",
  "shade-1": "fill-[color-mix(in_srgb,var(--lm-ink-hi)_16%,var(--lm-wall))]",
  wall: "fill-[color-mix(in_srgb,var(--lm-ink-hi)_12%,var(--lm-wall))]",
} satisfies { [tone in ToyFaceTone]: string };
const RAMP_SEGMENTS = getToyRampSegments();
const POST = 0.035;
const RAIL = 0.035;
const TOWER_RUNGS = 6;
const GANTRY_BAYS = 4;
const HANGER_YS = [1.25, 1.5];
const RAMP_TIE_FRACTIONS = [0.32, 0.5, 0.66];
const LED_INSET = 0.05;
const MAX_PUFFS = 72;
const MAX_JETS = 4;

type ToySetDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  runStartedAtMs: number;
  silent: boolean;
  details: SceneConfig["details"]["toyBox"];
};

/** Draw the flying car toy set: a long base with a red light strip, a curled ramp held by a lattice tower and gantry, and the roadster parked at the start, flying the ramp from `runStartedAtMs` (a `performance.now()` time) until the run ends. */
export function ToySetDrawing(props: ToySetDrawingProps) {
  const { quality } = useRenderQuality();
  const isLite = quality === "lite";
  const { projection, details } = props;
  const id = useId();
  const { position: origin, size } = props.laidOut.object;
  const { unit } = projection;
  const rampCarRef = useRef<SVGGElement>(null);
  const frontCarRef = useRef<SVGGElement>(null);
  const jetsRef = useRef<SVGGElement>(null);
  const plumesRef = useRef<SVGGElement>(null);
  useToyFlight({
    runStartedAtMs: props.runStartedAtMs,
    rampCarRef,
    frontCarRef,
    jetsRef,
    plumesRef,
    origin,
    projection,
    lite: isLite,
    silent: props.silent,
  });
  const parked = getToyFlightFrame({ elapsedMs: 0, origin }).pose;
  const lightStyle: React.CSSProperties & { "--lm-toy-light": string } = {
    "--lm-toy-light": details.lightColor,
  };

  function at(x: number, y: number, z: number) {
    return projectIsoPoint({
      point: { x: origin.x + x, y: origin.y + y, z: origin.z + z },
      projection,
    });
  }
  const { track, base, tower, gantry } = TOY_SET;
  const nearX = track.x + track.halfWidth;
  const farX = track.x - track.halfWidth;
  function surface(options: { pose: TrackPose; x: number; depth: number }) {
    const { pose, x, depth } = options;
    return at(
      x,
      pose.y - pose.normal.y * depth,
      pose.z - pose.normal.z * depth
    );
  }
  const visibleCount = RAMP_SEGMENTS.findIndex(
    (segment) => !segment.ridesVisible
  );
  const rampGroups = [
    RAMP_SEGMENTS.slice(0, visibleCount),
    RAMP_SEGMENTS.slice(visibleCount),
  ];

  function rampGroup(options: { segments: typeof RAMP_SEGMENTS; key: string }) {
    const { segments, key } = options;
    if (segments.length === 0) return null;
    const poses = [segments[0].from, ...segments.map(({ to }) => to)];
    const isOverhang = !segments[0].ridesVisible;
    const ledPoints = poses.map((pose) =>
      surface({ pose, x: nearX - LED_INSET * 0.4, depth: 0 })
    );
    return (
      <g key={key} data-toy-ramp={key}>
        {segments.map((segment, index) => {
          const depth = segment.ridesVisible ? 0 : track.thickness;
          const sign = segment.ridesVisible ? 1 : -1;
          const normal = {
            x: 0,
            y: sign * (segment.from.normal.y + segment.to.normal.y) * 0.5,
            z: sign * (segment.from.normal.z + segment.to.normal.z) * 0.5,
          };
          return (
            <polygon
              key={index}
              className={`${(segment.ridesVisible ? RIDE_FILLS : TONE_FILLS)[getToyFaceTone(normal)]} stroke-none`}
              points={toSvgPoints([
                surface({ pose: segment.from, x: farX, depth }),
                surface({ pose: segment.from, x: nearX, depth }),
                surface({ pose: segment.to, x: nearX, depth }),
                surface({ pose: segment.to, x: farX, depth }),
              ])}
            />
          );
        })}
        <polygon
          className="fill-[var(--lm-wall)] stroke-none"
          points={toSvgPoints([
            ...poses.map((pose) => surface({ pose, x: nearX, depth: 0 })),
            ...poses
              .toReversed()
              .map((pose) =>
                surface({ pose, x: nearX, depth: track.thickness })
              ),
          ])}
        />
        <g className="fill-none" strokeWidth={0.6}>
          <polyline
            className={partStroke(props.highlighted)}
            points={toSvgPoints(
              poses.map((pose) =>
                surface({ pose, x: nearX, depth: track.thickness })
              )
            )}
          />
          <polyline
            className={partStroke(props.highlighted)}
            points={toSvgPoints(
              poses.map((pose) =>
                surface({
                  pose,
                  x: farX,
                  depth: isOverhang ? track.thickness : 0,
                })
              )
            )}
          />
          <polyline
            className={partStroke(props.highlighted)}
            points={toSvgPoints(
              poses.map((pose) => surface({ pose, x: nearX, depth: 0 }))
            )}
          />
        </g>
        <polyline
          className="fill-none stroke-[var(--lm-toy-light)] opacity-25"
          strokeWidth={2.6}
          strokeLinecap="round"
          points={toSvgPoints(ledPoints)}
        />
        <polyline
          className="fill-none stroke-[var(--lm-toy-light)]"
          strokeWidth={0.7}
          strokeLinecap="round"
          points={toSvgPoints(ledPoints)}
        />
      </g>
    );
  }

  const lip = RAMP_SEGMENTS[RAMP_SEGMENTS.length - 1].to;
  const posts = [
    { x: tower.fromX, y: tower.fromY },
    { x: tower.toX, y: tower.fromY },
    { x: tower.fromX, y: tower.toY },
    { x: tower.toX, y: tower.toY },
  ];
  const rungZs = Array.from(
    { length: TOWER_RUNGS + 1 },
    (_, index) =>
      base.height + ((tower.height - base.height) * index) / TOWER_RUNGS
  );
  const nearPostX = tower.toX + POST / 2;
  const gantryBottom = tower.height - gantry.depth;
  const bayYs = Array.from(
    { length: GANTRY_BAYS + 1 },
    (_, index) =>
      tower.fromY + ((gantry.toY - tower.fromY) * index) / GANTRY_BAYS
  );
  const rampBackZ = base.height + TOY_SET.ramp.rise + track.thickness;
  const rampTies = RAMP_TIE_FRACTIONS.map((fraction) =>
    getToyTrackPose(
      TOY_TRACK_SECTIONS.floor +
        (TOY_TRACK_SECTIONS.curve - TOY_TRACK_SECTIONS.floor) * fraction
    )
  );
  const startLineY = TOY_SET.carStartY + 0.36;
  const endPlane = getFacePlane({
    plane: "front",
    origin: { x: origin.x, y: origin.y + size.d, z: origin.z + base.height },
    projection,
  });

  function post(x: number, y: number) {
    return (
      <IsoBox
        key={`${x},${y}`}
        position={{
          x: origin.x + x - POST / 2,
          y: origin.y + y - POST / 2,
          z: origin.z + base.height,
        }}
        size={{ w: POST, d: POST, h: tower.height - base.height }}
        projection={projection}
        bevel={false}
      />
    );
  }

  function rail(x: number) {
    return (
      <IsoBox
        key={x}
        position={{
          x: origin.x + x - RAIL / 2,
          y: origin.y + tower.fromY - POST / 2,
          z: origin.z + gantryBottom,
        }}
        size={{
          w: RAIL,
          d: gantry.toY - tower.fromY + POST / 2,
          h: gantry.depth,
        }}
        projection={projection}
        bevel={false}
      />
    );
  }

  return (
    <g data-toy-set strokeLinejoin="round" style={lightStyle}>
      <g className={partStroke(props.highlighted)} strokeWidth={1}>
        <IsoBox
          position={origin}
          size={{ w: size.w, d: size.d, h: base.height }}
          projection={projection}
          bevel={false}
        />
      </g>
      <g className="fill-none stroke-[var(--lm-detail)]" strokeWidth={0.6}>
        <polyline
          points={toSvgPoints([
            at(farX, startLineY, base.height),
            at(nearX, startLineY, base.height),
          ])}
        />
        <polyline
          strokeDasharray="3 3"
          points={toSvgPoints([
            at(track.x, TOY_SET.ramp.footY + 0.1, base.height),
            at(track.x, startLineY - 0.08, base.height),
          ])}
        />
      </g>
      <g transform={endPlane.transform}>
        <text
          x={(size.w * unit) / 2}
          y={base.height * unit * 0.8}
          textAnchor="middle"
          fontSize={base.height * unit * 0.85}
          className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-mono)]"
        >
          1955
        </text>
      </g>
      <polyline
        className="fill-none stroke-[var(--lm-toy-light)] opacity-25"
        strokeWidth={2.6}
        strokeLinecap="round"
        points={toSvgPoints([
          at(size.w - LED_INSET, LED_INSET, base.height),
          at(size.w - LED_INSET, size.d - LED_INSET, base.height),
        ])}
      />
      <polyline
        className="fill-none stroke-[var(--lm-toy-light)]"
        strokeWidth={0.7}
        strokeLinecap="round"
        points={toSvgPoints([
          at(size.w - LED_INSET, LED_INSET, base.height),
          at(size.w - LED_INSET, size.d - LED_INSET, base.height),
        ])}
      />
      <g className={partStroke(props.highlighted)} strokeWidth={0.5}>
        {posts.slice(0, 2).map((spot) => post(spot.x, spot.y))}
        <g className="fill-none stroke-[var(--lm-detail)]">
          {rungZs.slice(1).map((z, index) => (
            <polyline
              key={z}
              points={toSvgPoints([
                at(tower.fromX, tower.toY, rungZs[index]),
                at(tower.fromX, tower.toY, z),
              ])}
            />
          ))}
        </g>
        {posts.slice(2).map((spot) => post(spot.x, spot.y))}
        <g className="fill-none stroke-[var(--lm-line)]" strokeWidth={0.45}>
          {rungZs.map((z) => (
            <polyline
              key={z}
              points={toSvgPoints([
                at(nearPostX, tower.fromY, z),
                at(nearPostX, tower.toY, z),
              ])}
            />
          ))}
          {rungZs.slice(1).map((z, index) => (
            <polyline
              key={z}
              points={toSvgPoints([
                at(
                  nearPostX,
                  index % 2 === 0 ? tower.fromY : tower.toY,
                  rungZs[index]
                ),
                at(nearPostX, index % 2 === 0 ? tower.toY : tower.fromY, z),
              ])}
            />
          ))}
          {rampTies.map((pose) => {
            const back = {
              y: pose.y - pose.normal.y * track.thickness,
              z: pose.z - pose.normal.z * track.thickness,
            };
            return (
              <polyline
                key={pose.z}
                points={toSvgPoints([
                  at(nearPostX, tower.toY, back.z),
                  at(nearX, back.y, back.z),
                ])}
              />
            );
          })}
        </g>
      </g>
      {rampGroup({ segments: rampGroups[0], key: "riding" })}
      <g ref={rampCarRef} data-toy-slot="ramp" display="none">
        <ToyCarDrawing
          pose={parked}
          projection={projection}
          highlighted={props.highlighted}
        />
      </g>
      {rampGroup({ segments: rampGroups[1], key: "overhang" })}
      <polygon
        className="fill-[var(--lm-face)] stroke-none"
        points={toSvgPoints([
          surface({ pose: lip, x: farX, depth: 0 }),
          surface({ pose: lip, x: nearX, depth: 0 }),
          surface({ pose: lip, x: nearX, depth: track.thickness }),
          surface({ pose: lip, x: farX, depth: track.thickness }),
        ])}
      />
      <g className={partStroke(props.highlighted)} strokeWidth={0.5}>
        {rail(tower.fromX)}
        <g className="fill-none stroke-[var(--lm-line)]" strokeWidth={0.45}>
          {HANGER_YS.flatMap((y) =>
            [farX + 0.02, nearX - 0.02].map((x) => (
              <polyline
                key={`${x},${y}`}
                points={toSvgPoints([
                  at(x, y, rampBackZ),
                  at(x < track.x ? tower.fromX : tower.toX, y, gantryBottom),
                ])}
              />
            ))
          )}
          {bayYs.map((y) => (
            <polyline
              key={y}
              points={toSvgPoints([
                at(tower.fromX, y, tower.height),
                at(tower.toX, y, tower.height),
              ])}
            />
          ))}
          {bayYs.slice(1).map((y, index) => (
            <polyline
              key={y}
              points={toSvgPoints([
                at(
                  index % 2 === 0 ? tower.fromX : tower.toX,
                  bayYs[index],
                  tower.height
                ),
                at(index % 2 === 0 ? tower.toX : tower.fromX, y, tower.height),
              ])}
            />
          ))}
        </g>
        {rail(tower.toX)}
        <polyline
          className="fill-none"
          strokeWidth={0.45}
          points={toSvgPoints([
            at(nearPostX, tower.toY, tower.height - 0.45),
            at(tower.toX + RAIL / 2, tower.toY + 0.35, gantryBottom),
          ])}
        />
      </g>
      <g
        ref={jetsRef}
        data-toy-jets
        className="pointer-events-none stroke-none"
        style={{ fillOpacity: details.plumeOpacity }}
      >
        <defs>
          <linearGradient id={`${id}-jet`} x1={0} y1={0} x2={0} y2={1}>
            <stop offset={0} stopColor="var(--lm-ink-hi)" stopOpacity={0.95} />
            <stop offset={1} stopColor="var(--lm-ink-hi)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        {Array.from({ length: MAX_JETS }, (_, index) => (
          <polygon
            key={index}
            display="none"
            fill={isLite ? "var(--lm-ink-hi)" : `url(#${id}-jet)`}
          />
        ))}
      </g>
      <g ref={frontCarRef} data-toy-slot="front">
        <ToyCarDrawing
          pose={parked}
          projection={projection}
          highlighted={props.highlighted}
        />
      </g>
      <g
        ref={plumesRef}
        data-toy-plumes
        className="pointer-events-none stroke-none"
        style={{ fillOpacity: details.plumeOpacity }}
      >
        <defs>
          <radialGradient id={`${id}-puff`}>
            <stop offset={0.3} stopColor="var(--lm-ink-hi)" stopOpacity={0.9} />
            <stop offset={1} stopColor="var(--lm-ink-hi)" stopOpacity={0} />
          </radialGradient>
        </defs>
        {Array.from({ length: MAX_PUFFS }, (_, index) => (
          <circle
            key={index}
            data-toy-puff
            r={0}
            opacity={0}
            fill={isLite ? "var(--lm-ink-hi)" : `url(#${id}-puff)`}
          />
        ))}
      </g>
    </g>
  );
}
