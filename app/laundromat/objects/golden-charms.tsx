import { useEffect, useRef, useState } from "react";

import {
  type CharmFlight,
  type CharmKind,
  planCharmBurst,
} from "@/lib/laundromat/tip/plan-charm-burst";

const BURST_GAP_MS = {
  full: { min: 2200, max: 4000 },
  lite: { min: 3500, max: 5500 },
};
const MAX_CHARMS = { full: 8, lite: 3 };
const CHARM_SCALE = 2;
const OUTLINE = "var(--lm-recess)";

type Charm = CharmFlight & { id: number };

type CharmShapeProps = { kind: CharmKind };

function CharmShape(props: CharmShapeProps) {
  switch (props.kind) {
    case "heart":
      return (
        <path
          d="M 0 3.2 C -4.4 0.2 -4.2 -3.6 -2 -3.9 C -0.8 -4 0 -3 0 -2.3 C 0 -3 0.8 -4 2 -3.9 C 4.2 -3.6 4.4 0.2 0 3.2 Z"
          fill="#ff8fa3"
        />
      );
    case "clover":
      return (
        <g fill="#6fcf8a">
          <path
            d="M 0.4 1.2 Q 0.8 3 2.2 4"
            fill="none"
            stroke="#6fcf8a"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          {[
            [0, -1.7],
            [1.7, 0],
            [0, 1.7],
            [-1.7, 0],
          ].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={1.6} />
          ))}
        </g>
      );
    case "sun":
      return (
        <g>
          {Array.from({ length: 8 }, (_, index) => (
            <line
              key={index}
              x1={0}
              y1={-2.9}
              x2={0}
              y2={-4.1}
              stroke="#ffd25e"
              strokeWidth={0.8}
              strokeLinecap="round"
              transform={`rotate(${index * 45})`}
            />
          ))}
          <circle r={2.2} fill="#ffd25e" />
        </g>
      );
    case "smiley":
      return (
        <g>
          <circle r={3.2} fill="#ffd25e" />
          <circle cx={-1.1} cy={-0.8} r={0.45} fill={OUTLINE} stroke="none" />
          <circle cx={1.1} cy={-0.8} r={0.45} fill={OUTLINE} stroke="none" />
          <path
            d="M -1.6 0.8 Q 0 2.2 1.6 0.8"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      );
    case "star":
      return (
        <path
          d="M 0 -3.8 L 1.1 -1.2 L 3.6 -1.1 L 1.7 0.6 L 2.3 3.2 L 0 1.8 L -2.3 3.2 L -1.7 0.6 L -3.6 -1.1 L -1.1 -1.2 Z"
          fill="#ffe08a"
          strokeLinejoin="round"
        />
      );
    default: {
      const unhandled: never = props.kind;
      return unhandled;
    }
  }
}

type GoldenCharmsProps = {
  center: { x: number; y: number };
  tier: "full" | "lite";
};

/** Pop bursts of hearts, clovers, suns, smileys and stars out of `center` every few seconds while the tab is visible, each flying out on its own arc, squashing and stretching as it pops out, fewer and less often on the `lite` tier. */
export function GoldenCharms(props: GoldenCharmsProps) {
  const [charms, setCharms] = useState<Charm[]>([]);
  const nextIdRef = useRef(0);
  const { tier } = props;

  useEffect(() => {
    let timer: number | undefined;
    function schedule(delayMs: number) {
      timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          const burst = planCharmBurst({ tier, random: Math.random }).map(
            (flight) => {
              const id = nextIdRef.current;
              nextIdRef.current = id + 1;
              return { ...flight, id };
            }
          );
          setCharms((current) =>
            [...current, ...burst].slice(-MAX_CHARMS[tier])
          );
        }
        const gap = BURST_GAP_MS[tier];
        schedule(gap.min + Math.random() * (gap.max - gap.min));
      }, delayMs);
    }
    schedule(0);
    return () => window.clearTimeout(timer);
  }, [tier]);

  return (
    <g
      transform={`translate(${props.center.x} ${props.center.y})`}
      pointerEvents="none"
      stroke={OUTLINE}
      strokeWidth={0.5}
    >
      {charms.map((charm) => {
        const timing = `${charm.durationMs}ms ${charm.delayMs}ms both`;
        const style: React.CSSProperties & {
          "--charm-dx": string;
          "--charm-rise": string;
          "--charm-fall": string;
          "--charm-spin": string;
        } = {
          "--charm-dx": `${charm.dxPx}px`,
          "--charm-rise": `${charm.risePx}px`,
          "--charm-fall": `${charm.fallPx}px`,
          "--charm-spin": `${charm.spinDeg}deg`,
          animation: `lm-charm-across ${timing} cubic-bezier(0.25, 0.6, 0.4, 1)`,
        };
        return (
          <g key={charm.id} data-lm-motion style={style}>
            <g style={{ animation: `lm-charm-arc ${timing}` }}>
              <g
                style={{ animation: `lm-charm-pop ${timing} ease-out` }}
                onAnimationEnd={() =>
                  setCharms((current) =>
                    current.filter(({ id }) => id !== charm.id)
                  )
                }
              >
                <g transform={`scale(${CHARM_SCALE})`}>
                  <CharmShape kind={charm.kind} />
                </g>
              </g>
            </g>
          </g>
        );
      })}
    </g>
  );
}
