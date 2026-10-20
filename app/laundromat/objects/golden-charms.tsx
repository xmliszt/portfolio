import { useEffect, useRef, useState } from "react";

const CHARM_KINDS = ["heart", "clover", "sun", "smiley", "star"] as const;
const DELAY_MS = { min: 2000, max: 4200 };
const FLOAT_S = 2.6;
const CHARM_SCALE = 2;
const MAX_DRIFT_PX = 14;
const MAX_TILT_DEG = 18;
const OUTLINE = "var(--lm-recess)";

type CharmKind = (typeof CHARM_KINDS)[number];

type Charm = { id: number; kind: CharmKind; driftPx: number; tiltDeg: number };

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

type GoldenCharmsProps = { center: { x: number; y: number } };

/** Pop a small heart, clover, sun, smiley or star out of `center` every few seconds while the tab is visible, each floating up and fading, at most two at a time. */
export function GoldenCharms(props: GoldenCharmsProps) {
  const [charms, setCharms] = useState<Charm[]>([]);
  const nextIdRef = useRef(0);

  useEffect(() => {
    let timer: number | undefined;
    function schedule() {
      timer = window.setTimeout(
        () => {
          if (document.visibilityState === "visible") {
            const id = nextIdRef.current;
            nextIdRef.current = id + 1;
            setCharms((current) => [
              ...current.slice(-1),
              {
                id,
                kind: CHARM_KINDS[
                  Math.floor(Math.random() * CHARM_KINDS.length)
                ],
                driftPx: (Math.random() * 2 - 1) * MAX_DRIFT_PX,
                tiltDeg: (Math.random() * 2 - 1) * MAX_TILT_DEG,
              },
            ]);
          }
          schedule();
        },
        DELAY_MS.min + Math.random() * (DELAY_MS.max - DELAY_MS.min)
      );
    }
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <g
      transform={`translate(${props.center.x} ${props.center.y})`}
      pointerEvents="none"
      stroke={OUTLINE}
      strokeWidth={0.5}
    >
      {charms.map((charm) => {
        const style: React.CSSProperties & {
          "--charm-drift": string;
          "--charm-tilt": string;
        } = {
          "--charm-drift": `${charm.driftPx}px`,
          "--charm-tilt": `${charm.tiltDeg}deg`,
          animation: `lm-charm-float ${FLOAT_S}s cubic-bezier(0.2, 0.7, 0.3, 1) forwards`,
        };
        return (
          <g
            key={charm.id}
            data-lm-motion
            style={style}
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
        );
      })}
    </g>
  );
}
