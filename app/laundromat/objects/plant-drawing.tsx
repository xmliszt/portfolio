import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { CylinderSides } from "./cylinder-sides";
import { partStroke } from "./part-stroke";

type Leaf = {
  layer: "back" | "middle" | "front";
  stem: { x: number; y: number };
  angleDeg: number;
  length: number;
  squash: number;
  cycle: number;
};

const POT = { bottomRadius: 0.3, topRadius: 0.42, height: 0.9, rim: 0.12 };

const LEAVES: Leaf[] = [
  {
    layer: "back",
    stem: { x: -10, y: -34 },
    angleDeg: -38,
    length: 15,
    squash: 0.7,
    cycle: 0.1,
  },
  {
    layer: "back",
    stem: { x: 4, y: -40 },
    angleDeg: 8,
    length: 16,
    squash: 0.8,
    cycle: 0.6,
  },
  {
    layer: "back",
    stem: { x: 14, y: -30 },
    angleDeg: 46,
    length: 14,
    squash: 0.6,
    cycle: 0.3,
  },
  {
    layer: "back",
    stem: { x: -4, y: -46 },
    angleDeg: -12,
    length: 13,
    squash: 0.9,
    cycle: 0.8,
  },
  {
    layer: "back",
    stem: { x: -18, y: -22 },
    angleDeg: -64,
    length: 13,
    squash: 0.65,
    cycle: 0.45,
  },
  {
    layer: "back",
    stem: { x: 20, y: -18 },
    angleDeg: 70,
    length: 12,
    squash: 0.7,
    cycle: 0.95,
  },
  {
    layer: "middle",
    stem: { x: -8, y: -22 },
    angleDeg: -28,
    length: 15,
    squash: 0.85,
    cycle: 0.2,
  },
  {
    layer: "middle",
    stem: { x: 8, y: -26 },
    angleDeg: 22,
    length: 16,
    squash: 0.75,
    cycle: 0.7,
  },
  {
    layer: "middle",
    stem: { x: 0, y: -30 },
    angleDeg: -2,
    length: 14,
    squash: 1,
    cycle: 0.4,
  },
  {
    layer: "middle",
    stem: { x: -16, y: -12 },
    angleDeg: -78,
    length: 14,
    squash: 0.6,
    cycle: 0.85,
  },
  {
    layer: "middle",
    stem: { x: 17, y: -10 },
    angleDeg: 84,
    length: 13,
    squash: 0.65,
    cycle: 0.05,
  },
  {
    layer: "middle",
    stem: { x: 3, y: -16 },
    angleDeg: 32,
    length: 12,
    squash: 0.9,
    cycle: 0.55,
  },
  {
    layer: "front",
    stem: { x: -6, y: -8 },
    angleDeg: -50,
    length: 13,
    squash: 0.8,
    cycle: 0.35,
  },
  {
    layer: "front",
    stem: { x: 7, y: -6 },
    angleDeg: 58,
    length: 12,
    squash: 0.75,
    cycle: 0.65,
  },
  {
    layer: "front",
    stem: { x: -1, y: -12 },
    angleDeg: 12,
    length: 11,
    squash: 0.95,
    cycle: 0.15,
  },
  {
    layer: "front",
    stem: { x: -20, y: 12 },
    angleDeg: -150,
    length: 10,
    squash: 0.7,
    cycle: 0.9,
  },
  {
    layer: "front",
    stem: { x: 19, y: 22 },
    angleDeg: 160,
    length: 10,
    squash: 0.75,
    cycle: 0.5,
  },
  {
    layer: "front",
    stem: { x: -22, y: 30 },
    angleDeg: 175,
    length: 9,
    squash: 0.8,
    cycle: 0.25,
  },
];

const VINES = [
  "M -14 2 C -24 4 -24 18 -20 12 C -22 22 -24 28 -22 30",
  "M 12 3 C 22 6 22 16 19 22",
];

function getLeafPath(length: number) {
  const l = length;
  return [
    "M 0 0",
    `C ${-0.12 * l} ${-0.02 * l} ${-0.62 * l} ${-0.08 * l} ${-0.5 * l} ${-0.48 * l}`,
    `C ${-0.42 * l} ${-0.76 * l} ${-0.12 * l} ${-0.88 * l} 0 ${-l}`,
    `C ${0.12 * l} ${-0.88 * l} ${0.42 * l} ${-0.76 * l} ${0.5 * l} ${-0.48 * l}`,
    `C ${0.62 * l} ${-0.08 * l} ${0.12 * l} ${-0.02 * l} 0 0`,
    "Z",
  ].join(" ");
}

function getVeinsPath(length: number) {
  const l = length;
  return [
    `M 0 ${-0.08 * l} L 0 ${-0.9 * l}`,
    `M 0 ${-0.3 * l} Q ${-0.2 * l} ${-0.36 * l} ${-0.32 * l} ${-0.5 * l}`,
    `M 0 ${-0.3 * l} Q ${0.2 * l} ${-0.36 * l} ${0.32 * l} ${-0.5 * l}`,
    `M 0 ${-0.55 * l} Q ${-0.14 * l} ${-0.6 * l} ${-0.22 * l} ${-0.72 * l}`,
    `M 0 ${-0.55 * l} Q ${0.14 * l} ${-0.6 * l} ${0.22 * l} ${-0.72 * l}`,
  ].join(" ");
}

type PlantDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  details: SceneConfig["details"]["plant"];
};

export function PlantDrawing(props: PlantDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection, details } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const pot = getIsoCylinder({
    center,
    bottom: p.z,
    top: p.z + POT.height - POT.rim,
    radius: POT.bottomRadius,
    topRadius: POT.topRadius - 0.02,
    projection,
  });
  const rim = getIsoCylinder({
    center,
    bottom: p.z + POT.height - POT.rim,
    top: p.z + POT.height,
    radius: POT.topRadius,
    projection,
  });
  const soil = getIsoEllipse({
    center: { ...center, z: p.z + POT.height - 0.03 },
    radius: POT.topRadius - 0.05,
    projection,
  });
  const scale = projection.unit / 40;
  const bendSeconds = (details.swayMinSeconds + details.swayMaxSeconds) / 2;
  const bend = {
    "data-lm-motion": true,
    style: {
      animation: `lm-bend ${bendSeconds}s ease-in-out infinite alternate`,
    },
  };
  function renderLeaves(layer: Leaf["layer"]) {
    return LEAVES.filter((leaf) => leaf.layer === layer).map((leaf) => {
      const seconds =
        details.swayMinSeconds +
        (details.swayMaxSeconds - details.swayMinSeconds) * leaf.cycle;
      return (
        <g
          key={`${leaf.stem.x},${leaf.stem.y}`}
          transform={`translate(${leaf.stem.x} ${leaf.stem.y})`}
        >
          <line
            x1={0}
            y1={0}
            x2={-leaf.stem.x * 0.7}
            y2={-leaf.stem.y * 0.7 + 2}
            className="stroke-[var(--lm-detail)]"
            strokeWidth={0.75}
          />
          <g
            data-lm-motion
            style={{
              animation: `lm-sway ${seconds}s ease-in-out ${-seconds * leaf.cycle * 2}s infinite alternate`,
            }}
          >
            <g transform={`rotate(${leaf.angleDeg}) scale(${leaf.squash} 1)`}>
              <path
                d={getLeafPath(leaf.length)}
                className="fill-[var(--lm-face)]"
              />
              <path
                d={getVeinsPath(leaf.length)}
                className="fill-none stroke-[var(--lm-detail)]"
                strokeWidth={0.6}
              />
            </g>
          </g>
        </g>
      );
    });
  }
  return (
    <g
      className={partStroke(props.highlighted)}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <g transform={`translate(${soil.cx} ${soil.cy}) scale(${scale})`}>
        <g {...bend}>{renderLeaves("back")}</g>
      </g>
      <CylinderSides body={pot.body} facets={pot.facets} />
      <path d={rim.body} className="fill-[var(--lm-face-top)]" />
      <ellipse {...rim.top} className="fill-[var(--lm-face-top)]" />
      <ellipse
        {...soil}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      <g transform={`translate(${soil.cx} ${soil.cy}) scale(${scale})`}>
        <g {...bend}>
          {renderLeaves("middle")}
          <g className="fill-none" strokeWidth={0.75}>
            {VINES.map((vine) => (
              <path key={vine} d={vine} />
            ))}
          </g>
          {renderLeaves("front")}
        </g>
      </g>
    </g>
  );
}
