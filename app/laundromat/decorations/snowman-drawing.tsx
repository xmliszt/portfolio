import { useId } from "react";

import { getColorShades } from "@/lib/laundromat/decorations/get-color-shades";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type {
  IsoPoint,
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { useDecorationPose } from "./use-decoration-pose";

const SPHERE_SCALE = Math.sqrt(1.5);
const HAT = "#2b2a31";
const TWIG = "#5e4330";
const FACING = Math.PI * 0.4;

type SnowmanDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "snowman" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function SnowmanDrawing(props: SnowmanDrawingProps) {
  const { pose, progress, reducedMotion } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const id = useId();
  const { position, size } = props.object;
  const { projection } = props;
  const { unit } = projection;
  const { bauble, snow } = props.details;
  const center = { x: position.x + size.w / 2, y: position.y + size.d / 2 };
  function project(point: IsoPoint) {
    return projectIsoPoint({ point, projection });
  }
  function facing(options: {
    z: number;
    radius: number;
    turn: number;
    lift: number;
  }) {
    const angle = FACING + options.turn;
    const flat = Math.cos(options.lift);
    return {
      x: center.x + Math.cos(angle) * flat * options.radius,
      y: center.y + Math.sin(angle) * flat * options.radius,
      z: options.z + Math.sin(options.lift) * options.radius,
    };
  }
  const radii = [0.2, 0.15, 0.11].map((ratio) => ratio * size.h);
  const bottomZ = position.z + radii[0];
  const middleZ = bottomZ + (radii[0] + radii[1]) * 0.8;
  const headZ = middleZ + (radii[1] + radii[2]) * 0.8;
  const balls = [
    { z: bottomZ, radius: radii[0] },
    { z: middleZ, radius: radii[1] },
    { z: headZ, radius: radii[2] },
  ].map((ball) => ({
    ...project({ ...center, z: ball.z }),
    r: ball.radius * unit * SPHERE_SCALE,
    ...ball,
  }));
  const [bottom, middle, head] = balls;
  const neckZ = middleZ + radii[1] * 0.72;
  const scarf = getIsoEllipse({
    center: { ...center, z: neckZ },
    radius: radii[1] * 0.72,
    projection,
  });
  const scarfWidth = radii[2] * unit * 0.5;
  const scarfShades = getColorShades(bauble);
  const tailTop = project(
    facing({ z: neckZ, radius: radii[1] * 0.72, turn: 0.5, lift: 0 })
  );
  const tailLength = radii[1] * unit * 1.1;
  const brim = getIsoCylinder({
    center,
    bottom: headZ + radii[2] * 0.72,
    top: headZ + radii[2] * 0.8,
    radius: radii[2] * 1.05,
    projection,
  });
  const crown = getIsoCylinder({
    center,
    bottom: headZ + radii[2] * 0.8,
    top: headZ + radii[2] * 0.8 + size.h * 0.12,
    radius: radii[2] * 0.66,
    projection,
  });
  const hatShades = getColorShades(HAT);
  const eyes = [-0.38, 0.38].map((turn) =>
    project(facing({ z: headZ, radius: radii[2], turn, lift: 0.35 }))
  );
  const noseRoot = facing({ z: headZ, radius: radii[2], turn: 0, lift: 0.05 });
  const nose = project(noseRoot);
  const noseTip = project({
    x: noseRoot.x + Math.cos(FACING) * radii[2] * 0.9,
    y: noseRoot.y + Math.sin(FACING) * radii[2] * 0.9,
    z: noseRoot.z - radii[2] * 0.1,
  });
  const noseHalf = radii[2] * unit * 0.13;
  const buttons = [0.55, 0.15, -0.25].map((lift) =>
    project(facing({ z: middleZ, radius: radii[1], turn: 0.05, lift }))
  );
  const arms = [-1, 1].map((side) => {
    const angle = FACING + (side * Math.PI) / 2;
    const from = project({
      x: center.x + Math.cos(angle) * radii[1] * 0.9,
      y: center.y + Math.sin(angle) * radii[1] * 0.9,
      z: middleZ + radii[1] * 0.2,
    });
    const to = project({
      x: center.x + Math.cos(angle) * radii[1] * 2.3,
      y: center.y + Math.sin(angle) * radii[1] * 2.3,
      z: middleZ + radii[1] * 0.95,
    });
    return { from, to, side };
  });
  const base = project({ ...center, z: position.z });
  const wobble = reducedMotion
    ? pose * props.reactionSettings.strength * 0.4
    : Math.sin(progress * Math.PI * 6) *
      (1 - progress) ** 2 *
      props.reactionSettings.strength;
  const hop =
    reducedMotion || progress >= 1
      ? 0
      : Math.abs(Math.sin(progress * Math.PI * 2)) *
        (1 - progress) *
        props.reactionSettings.strength;
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <defs>
        <radialGradient id={`${id}-snow`} cx="0.36" cy="0.32" r="0.78">
          <stop stopColor="#fffdf7" />
          <stop offset="0.55" stopColor={snow} />
          <stop
            offset="1"
            stopColor={`color-mix(in srgb, ${snow} 62%, #4b5a78)`}
          />
        </radialGradient>
      </defs>
      <g
        style={{
          transformOrigin: `${base.x}px ${base.y}px`,
          transform: `translateY(${-hop * size.h * unit * 0.12}px) rotate(${wobble * 9}deg)`,
        }}
      >
        {arms
          .filter((arm) => arm.side > 0)
          .map((arm) => (
            <Twig key={arm.side} from={arm.from} to={arm.to} />
          ))}
        {[bottom, middle].map((ball, index) => (
          <circle
            key={index}
            cx={ball.x}
            cy={ball.y}
            r={ball.r}
            fill={`url(#${id}-snow)`}
            stroke={`color-mix(in srgb, ${snow} 50%, #4b5a78)`}
            strokeWidth={0.5}
          />
        ))}
        {buttons.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={middle.r * 0.08}
            fill="#26252b"
          />
        ))}
        <ellipse
          cx={scarf.cx}
          cy={scarf.cy}
          rx={scarf.rx}
          ry={scarf.ry}
          fill="none"
          stroke={scarfShades[2]}
          strokeWidth={scarfWidth}
        />
        <circle
          cx={head.x}
          cy={head.y}
          r={head.r}
          fill={`url(#${id}-snow)`}
          stroke={`color-mix(in srgb, ${snow} 50%, #4b5a78)`}
          strokeWidth={0.5}
        />
        <path
          d={`M${scarf.cx - scarf.rx},${scarf.cy} A${scarf.rx} ${scarf.ry} 0 0 0 ${scarf.cx + scarf.rx},${scarf.cy}`}
          fill="none"
          stroke={scarfShades[1]}
          strokeWidth={scarfWidth}
        />
        <path
          d={`M${tailTop.x - scarfWidth * 0.5},${tailTop.y} l${-scarfWidth * 0.25},${tailLength} l${scarfWidth},${-scarfWidth * 0.15} l${-scarfWidth * 0.1},${-tailLength}Z`}
          fill={scarfShades[1]}
          stroke={scarfShades[3]}
          strokeWidth={0.5}
        />
        <path
          d={`M${tailTop.x - scarfWidth * 0.68},${tailTop.y + tailLength * 0.7} l${scarfWidth * 0.95},${-scarfWidth * 0.12}`}
          stroke={snow}
          strokeWidth={0.8}
        />
        {eyes.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={head.r * 0.09}
            fill="#26252b"
          />
        ))}
        <polygon
          points={toSvgPoints([
            { x: nose.x, y: nose.y - noseHalf },
            noseTip,
            { x: nose.x, y: nose.y + noseHalf },
          ])}
          fill="#e07b2c"
          stroke="#8a4314"
          strokeWidth={0.4}
        />
        <g stroke="none">
          <path d={brim.body} fill={hatShades[2]} />
          <ellipse
            cx={brim.top.cx}
            cy={brim.top.cy}
            rx={brim.top.rx}
            ry={brim.top.ry}
            fill={hatShades[1]}
          />
          <path d={crown.body} fill={hatShades[1]} />
          {crown.facets.map((facet) => (
            <polygon
              key={facet.shade}
              points={toSvgPoints(facet.points)}
              fill={hatShades[3 - facet.shade]}
            />
          ))}
          <ellipse
            cx={crown.top.cx}
            cy={crown.top.cy}
            rx={crown.top.rx}
            ry={crown.top.ry}
            fill={hatShades[0]}
          />
          <path
            d={`M${crown.base.cx - crown.base.rx},${crown.base.cy - crown.base.ry * 0.9} A${crown.base.rx} ${crown.base.ry} 0 0 0 ${crown.base.cx + crown.base.rx},${crown.base.cy - crown.base.ry * 0.9}`}
            fill="none"
            stroke={bauble}
            strokeWidth={Math.max(1, crown.base.ry * 0.7)}
          />
        </g>
        {arms
          .filter((arm) => arm.side < 0)
          .map((arm) => (
            <Twig key={arm.side} from={arm.from} to={arm.to} />
          ))}
      </g>
    </g>
  );
}

type TwigProps = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

function Twig(props: TwigProps) {
  const fork = {
    x: props.from.x + (props.to.x - props.from.x) * 0.7,
    y: props.from.y + (props.to.y - props.from.y) * 0.7,
  };
  return (
    <path
      d={`M${props.from.x},${props.from.y} L${props.to.x},${props.to.y} M${fork.x},${fork.y} l${(props.to.x - props.from.x) * 0.18},${-Math.abs(props.to.y - props.from.y) * 0.5 - 2}`}
      fill="none"
      stroke={TWIG}
      strokeWidth={1.1}
    />
  );
}
