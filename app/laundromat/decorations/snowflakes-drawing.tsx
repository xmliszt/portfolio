import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type {
  SceneConfig,
  SceneDecoration,
} from "@/lib/laundromat/scene-config";

import { useDecorationPose } from "./use-decoration-pose";

const FLAKES = [
  { across: 0.14, drop: 0.38 },
  { across: 0.38, drop: 0.68 },
  { across: 0.62, drop: 0.46 },
  { across: 0.86, drop: 0.74 },
];

const ARMS = Array.from({ length: 6 }, (_, index) => (index * Math.PI) / 3);

type SnowflakesDrawingProps = {
  reaction?: number;
  reactionSettings: SceneConfig["details"]["decorationReaction"];
  object: Extract<SceneDecoration, { kind: "snowflakes" }>;
  projection: IsoProjection;
  details: SceneConfig["details"]["christmas"];
};

export function SnowflakesDrawing(props: SnowflakesDrawingProps) {
  const { pose, progress, reducedMotion } = useDecorationPose({
    reaction: props.reaction,
    durationMs: props.reactionSettings.durationMs,
  });
  const { quality } = useRenderQuality();
  const { position, size } = props.object;
  const { unit } = props.projection;
  const { snow } = props.details;
  const face = getFacePlane({
    plane: "side",
    origin: {
      x: position.x + size.w,
      y: position.y + size.d,
      z: position.z + size.h,
    },
    projection: props.projection,
  });
  const width = size.d * unit;
  const height = size.h * unit;
  const radius = Math.min(width * 0.11, height * 0.12);
  const arm = ARMS.map((angle) => {
    const tip = { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
    const branches = [0.45, 0.72].map((along) => {
      const from = { x: tip.x * along, y: tip.y * along };
      const reach = radius * (0.85 - along) * 0.9;
      return [-1, 1].map((side) => ({
        x1: from.x,
        y1: from.y,
        x2: from.x + Math.sin(angle + side * 0.8) * reach,
        y2: from.y - Math.cos(angle + side * 0.8) * reach,
      }));
    });
    return { tip, branches: branches.flat() };
  });
  const turnCount = Math.max(
    1,
    Math.round(2 * props.reactionSettings.strength)
  );
  return (
    <g
      data-lm-decoration={props.object.id}
      data-reaction={pose > 0 ? "active" : "idle"}
      transform={face.transform}
      strokeLinecap="round"
    >
      {FLAKES.map((flake, index) => {
        const x = flake.across * width;
        const y = flake.drop * height;
        const local = Math.min(
          1,
          Math.max(0, (progress - index * 0.06) / 0.82)
        );
        const spin = reducedMotion
          ? pose * 0.5
          : Math.abs(Math.cos((1 - (1 - local) ** 2) * turnCount * Math.PI));
        return (
          <g key={index}>
            <line
              x1={x}
              y1={0}
              x2={x}
              y2={y - radius}
              stroke={snow}
              strokeOpacity={0.55}
              strokeWidth={0.4}
            />
            <circle cx={x} cy={0} r={0.8} fill={snow} />
            <g transform={`translate(${x} ${y})`}>
              <g
                className={quality === "full" ? "lm-snowflake-sway" : undefined}
                style={{ animationDelay: `${-index * 1.7}s` }}
              >
                <g
                  transform={
                    pose === 0 ? undefined : `scale(${Math.max(0.12, spin)} 1)`
                  }
                  stroke={snow}
                  strokeWidth={0.9}
                >
                  {arm.map((item, armIndex) => (
                    <g key={armIndex}>
                      <line x1={0} y1={0} x2={item.tip.x} y2={item.tip.y} />
                      {item.branches.map((branch, branchIndex) => (
                        <line key={branchIndex} {...branch} />
                      ))}
                    </g>
                  ))}
                  <circle r={radius * 0.16} fill={snow} stroke="none" />
                </g>
              </g>
            </g>
          </g>
        );
      })}
      <style>{`@keyframes lm-snowflake-sway { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } } @media (prefers-reduced-motion: no-preference) { .lm-snowflake-sway { transform-origin: 0 0; animation: lm-snowflake-sway 6s ease-in-out infinite; } }`}</style>
    </g>
  );
}
