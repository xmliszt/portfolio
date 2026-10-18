import { toyBoxTitleFont } from "./toy-box-title-font";

const ART = { width: 200, height: 70 };
const CAR_BODY = [
  [56, 58],
  [58, 52],
  [84, 48.5],
  [97, 42.5],
  [119, 42.5],
  [133, 48.5],
  [144, 50.5],
  [144, 58],
];
const CAR_WINDOW = [
  [90, 48.5],
  [99.5, 44],
  [117, 44],
  [126, 48.5],
];
const WHEEL_XS = [72, 130];
const WHEEL_Y = 58.5;
const BOLTS = [
  [
    [14, 2],
    [30, 18],
    [24, 20],
    [46, 40],
  ],
  [
    [188, 2],
    [170, 16],
    [177, 19],
    [152, 38],
  ],
];
const FLAME_TRACKS = [
  { y: 64, fromX: 4, toX: 70 },
  { y: 67.5, fromX: 14, toX: 128 },
];
const FLAME_STEP = 4;

function toPoints(points: number[][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function flamePoints(track: (typeof FLAME_TRACKS)[number]) {
  const count = Math.floor((track.toX - track.fromX) / FLAME_STEP);
  return Array.from({ length: count + 1 }, (_, index) => {
    const x = track.fromX + index * FLAME_STEP;
    const lift = index % 2 === 0 ? 0 : 2.6 * (index / count);
    return [x, track.y - lift];
  });
}

function skewAround(point: { x: number; y: number }) {
  return `translate(${point.x} ${point.y}) skewX(-12) translate(${-point.x} ${-point.y})`;
}

type ToyBoxLidPrintProps = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Draw the lid's movie poster print inside the `x`, `y`, `width`, `height` panel: lightning from the top corners, the title in slanted poster capitals, the roadster in profile, and the flame tracks behind its wheels. */
export function ToyBoxLidPrint(props: ToyBoxLidPrintProps) {
  const scale = Math.min(props.width / ART.width, props.height / ART.height);
  const offsetX = props.x + (props.width - ART.width * scale) / 2;
  const offsetY = props.y + (props.height - ART.height * scale) / 2;
  return (
    <g transform={`translate(${offsetX} ${offsetY}) scale(${scale})`}>
      <g className="fill-none stroke-[var(--lm-ink)]" strokeWidth={1.1}>
        {BOLTS.map((bolt) => (
          <polyline key={bolt[0][0]} points={toPoints(bolt)} />
        ))}
      </g>
      <g
        className={`fill-[var(--lm-ink-hi)] stroke-none ${toyBoxTitleFont.className}`}
        textAnchor="middle"
      >
        <text
          x={100}
          y={17}
          fontSize={12}
          letterSpacing={2}
          transform={skewAround({ x: 100, y: 17 })}
        >
          IT IS THE
        </text>
        <text
          x={100}
          y={36}
          fontSize={18}
          letterSpacing={1}
          transform={skewAround({ x: 100, y: 36 })}
        >
          FUTURE
        </text>
      </g>
      <line
        x1={58}
        y1={39.5}
        x2={142}
        y2={39.5}
        className="stroke-[var(--lm-ink)]"
        strokeWidth={1.2}
      />
      <g className="fill-none stroke-[var(--lm-toy-light)]" strokeWidth={1.1}>
        {FLAME_TRACKS.map((track) => (
          <polyline key={track.y} points={toPoints(flamePoints(track))} />
        ))}
      </g>
      <polygon
        points={toPoints(CAR_BODY)}
        className="fill-[var(--lm-shade-2)] stroke-[var(--lm-ink-hi)]"
        strokeWidth={0.9}
      />
      <polygon
        points={toPoints(CAR_WINDOW)}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-ink)]"
        strokeWidth={0.7}
      />
      <line
        x1={108}
        y1={44}
        x2={108}
        y2={48.5}
        className="stroke-[var(--lm-ink)]"
        strokeWidth={0.7}
      />
      {WHEEL_XS.map((x) => (
        <g key={x}>
          <circle
            cx={x}
            cy={WHEEL_Y}
            r={5}
            className="fill-[var(--lm-recess)] stroke-[var(--lm-ink-hi)]"
            strokeWidth={0.9}
          />
          <circle
            cx={x}
            cy={WHEEL_Y}
            r={1.8}
            className="fill-[var(--lm-ink)] stroke-none"
          />
        </g>
      ))}
      <rect
        x={2}
        y={44}
        width={30}
        height={12}
        rx={1.5}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-ink)]"
        strokeWidth={0.8}
      />
      <text
        x={17}
        y={53}
        fontSize={8.5}
        textAnchor="middle"
        className="fill-[var(--lm-toy-light)] stroke-none font-[family-name:var(--lm-font-mono)]"
      >
        1955
      </text>
    </g>
  );
}
