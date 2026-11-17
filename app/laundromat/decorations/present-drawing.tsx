import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { useDecorationPose } from "./use-decoration-pose";

type PresentDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "present" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function PresentDrawing(props: PresentDrawingProps) {
  const { pose, progress, reducedMotion } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const { position, size } = props.object;
  const { unit } = props.projection;
  const { needle, bauble, gold, snow } = props.details;
  const wrap = { red: bauble, green: needle, cream: snow }[props.object.wrap];
  const ribbon = props.object.wrap === "cream" ? bauble : gold;
  const paper = getColorShades(wrap);
  const tape = getColorShades(ribbon);
  const faces = getBoxFaces({ position, size, projection: props.projection });
  const top = { ...position, z: position.z + size.h };
  const frontPlane = getFacePlane({
    plane: "front",
    origin: { ...top, y: position.y + size.d },
    projection: props.projection,
  });
  const sidePlane = getFacePlane({
    plane: "side",
    origin: { ...top, x: position.x + size.w, y: position.y + size.d },
    projection: props.projection,
  });
  const topPlane = getFacePlane({
    plane: "top",
    origin: top,
    projection: props.projection,
  });
  const band = Math.min(size.w, size.d) * 0.16 * unit;
  const knot = projectIsoPoint({
    point: {
      x: position.x + size.w / 2,
      y: position.y + size.d / 2,
      z: position.z + size.h,
    },
    projection: props.projection,
  });
  const loop = Math.min(size.w, size.d) * unit * 0.3;
  const hop =
    Math.abs(Math.sin(progress * Math.PI * 2)) *
    (1 - progress) *
    props.reactionSettings.strength;
  const tilt =
    Math.sin(progress * Math.PI * 4) *
    (1 - progress) *
    props.reactionSettings.strength;
  const base = projectIsoPoint({
    point: {
      x: position.x + size.w / 2,
      y: position.y + size.d,
      z: position.z,
    },
    projection: props.projection,
  });
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      strokeLinejoin="round"
    >
      <g
        style={{
          transformOrigin: `${base.x}px ${base.y}px`,
          transform: reducedMotion
            ? `translateY(${-pose * props.reactionSettings.strength * size.h * unit * 0.2}px) rotate(${pose * props.reactionSettings.strength * 4}deg)`
            : `translateY(${-hop * size.h * unit * 0.45}px) rotate(${tilt * 6}deg)`,
        }}
      >
        <g stroke="var(--lm-line)" strokeWidth={0.6}>
          <polygon points={toSvgPoints(faces.front)} fill={paper[1]} />
          <polygon points={toSvgPoints(faces.side)} fill={paper[2]} />
          <polygon points={toSvgPoints(faces.top)} fill={paper[0]} />
        </g>
        <g stroke="none">
          <rect
            transform={frontPlane.transform}
            x={(size.w * unit - band) / 2}
            y={0}
            width={band}
            height={size.h * unit}
            fill={tape[1]}
          />
          <rect
            transform={sidePlane.transform}
            x={(size.d * unit - band) / 2}
            y={0}
            width={band}
            height={size.h * unit}
            fill={tape[2]}
          />
          <g transform={topPlane.transform} fill={tape[0]}>
            <rect
              x={(size.w * unit - band) / 2}
              y={0}
              width={band}
              height={size.d * unit}
            />
            <rect
              x={0}
              y={(size.d * unit - band) / 2}
              width={size.w * unit}
              height={band}
            />
          </g>
        </g>
        <g stroke={tape[3]} strokeWidth={0.6} fill={tape[1]}>
          <path
            d={`M${knot.x},${knot.y} C${knot.x - loop * 1.3},${knot.y - loop * 1.1} ${knot.x - loop * 1.4},${knot.y + loop * 0.2} ${knot.x},${knot.y}Z`}
          />
          <path
            d={`M${knot.x},${knot.y} C${knot.x + loop * 1.3},${knot.y - loop * 1.1} ${knot.x + loop * 1.4},${knot.y + loop * 0.2} ${knot.x},${knot.y}Z`}
            fill={tape[2]}
          />
          <path
            d={`M${knot.x},${knot.y} L${knot.x - loop * 0.5},${knot.y + loop * 0.8} M${knot.x},${knot.y} L${knot.x + loop * 0.4},${knot.y + loop * 0.85}`}
            fill="none"
            stroke={tape[1]}
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <ellipse
            cx={knot.x}
            cy={knot.y}
            rx={loop * 0.28}
            ry={loop * 0.22}
            fill={tape[0]}
          />
        </g>
      </g>
    </g>
  );
}
