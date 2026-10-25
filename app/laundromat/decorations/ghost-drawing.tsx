import { useId } from "react";

import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

type GhostDrawingProps = {
  object: Extract<SceneDecoration, { kind: "ghost" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["ghost"];
};

export function GhostDrawing(props: GhostDrawingProps) {
  const id = useId();
  const { quality } = useRenderQuality();
  const { position, size } = props.object;
  const anchor = projectIsoPoint({
    point: { x: position.x, y: position.y, z: position.z + size.h },
    projection: props.projection,
  });
  const center = projectIsoPoint({
    point: {
      x: position.x + size.w * 0.5,
      y: position.y + size.d * 0.5,
      z: position.z + size.h * 0.76,
    },
    projection: props.projection,
  });
  const width = size.w * props.projection.unit;
  const height = size.h * 0.76 * props.projection.unit;
  const { cloth, shade, swaySeconds } = props.details;
  return (
    <g
      data-lm-decoration={props.object.id}
      className="[&_*]:[vector-effect:non-scaling-stroke]"
      stroke="none"
    >
      <defs>
        <linearGradient id={`${id}-cloth`}>
          <stop stopColor={shade} />
          <stop offset="0.28" stopColor={cloth} />
          <stop offset="0.56" stopColor={cloth} />
          <stop offset="1" stopColor={shade} />
        </linearGradient>
      </defs>
      <circle cx={anchor.x} cy={anchor.y} r="1.1" fill="var(--lm-detail)" />
      <path
        d={`M${anchor.x},${anchor.y} Q${anchor.x},${center.y} ${center.x},${center.y}`}
        fill="none"
        stroke={shade}
        strokeWidth="0.6"
      />
      <g
        transform={`translate(${center.x} ${center.y}) scale(${width} ${height})`}
      >
        <g
          className={quality === "full" ? "lm-ghost-cloth" : undefined}
          style={{ animationDuration: `${swaySeconds}s` }}
        >
          <path
            d="M0,0 C-.17,0 -.24,.13 -.25,.29 C-.27,.5 -.38,.76 -.52,.92 Q-.37,.99 -.24,.85 Q-.14,1.07 0,.9 Q.16,1.05 .27,.87 Q.39,.98 .51,.9 C.33,.67 .25,.47 .24,.28 C.23,.12 .15,0 0,0Z"
            fill={`url(#${id}-cloth)`}
          />
          <path
            d="M-.17,.36 Q-.19,.65 -.24,.85 Q-.14,.97 -.1,.82 Q-.14,.63 -.17,.36 M.16,.35 Q.14,.63 .27,.87 Q.18,.81 .13,.73Z"
            fill={shade}
            opacity="0.55"
          />
          <path
            d="M-.04,.42 Q.02,.66 0,.9 Q.09,.78 .05,.59Z"
            fill={shade}
            opacity="0.28"
          />
          <path
            d="M-.52,.92 Q-.37,.99 -.24,.85 Q-.14,1.07 0,.9 Q.16,1.05 .27,.87 Q.39,.98 .51,.9"
            fill="none"
            stroke={cloth}
            strokeWidth="0.75"
          />
          <ellipse
            cx="-.105"
            cy=".27"
            rx=".052"
            ry=".069"
            fill="#302a39"
            transform="rotate(-8 -.105 .27)"
          />
          <ellipse
            cx=".095"
            cy=".27"
            rx=".049"
            ry=".067"
            fill="#302a39"
            transform="rotate(8 .095 .27)"
          />
          <ellipse cx="0" cy=".4" rx=".028" ry=".04" fill="#514654" />
        </g>
      </g>
      <style>{`@keyframes lm-ghost-cloth { 0%, 100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } } @media (prefers-reduced-motion: no-preference) { .lm-ghost-cloth { transform-origin: 0 0; animation: lm-ghost-cloth 5.5s ease-in-out infinite; } }`}</style>
    </g>
  );
}
