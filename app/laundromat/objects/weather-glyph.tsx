import type { WeatherCondition } from "@/lib/laundromat/weather/weather-reading";

const SUN_RAYS = 8;
const RAIN_DROPS = [-4, 0, 4];
const SNOW_FLAKES = [
  { x: -4, y: 7 },
  { x: 0, y: 9.5 },
  { x: 4, y: 7 },
];
const MOON_PATH = "M 0.2 -5 A 5 5 0 1 0 4.74 1.58 A 4 4 0 0 1 0.2 -5 Z";
const BOLT_POINTS = "1.4,3.6 -2.4,8.6 0.2,8.6 -1.2,12.4 3.4,7 0.8,7 2.6,3.6";
const CLOUD_PARTS = [
  { kind: "rect", x: -8, y: -0.5, width: 16, height: 5, rx: 2.5 },
  { kind: "circle", cx: -4, cy: 0.6, r: 3.2 },
  { kind: "circle", cx: 1, cy: -2.2, r: 4.6 },
  { kind: "circle", cx: 5.3, cy: 0.9, r: 3 },
] as const;

type WeatherGlyphProps = {
  condition: WeatherCondition;
  isDay: boolean;
  animated: boolean;
  motionSeconds: number;
};

function Sun(props: { animated: boolean; motionSeconds: number }) {
  return (
    <g className="stroke-[var(--lm-accent)]" strokeWidth={1.3}>
      <circle r={4} className="fill-[var(--lm-accent)]" fillOpacity={0.25} />
      <g
        data-lm-motion
        style={
          props.animated
            ? {
                transformBox: "fill-box",
                transformOrigin: "center",
                animation: `lm-spin ${props.motionSeconds * 20}s linear infinite`,
              }
            : undefined
        }
      >
        {Array.from({ length: SUN_RAYS }, (_, index) => {
          const angle = (index / SUN_RAYS) * Math.PI * 2;
          return (
            <line
              key={index}
              x1={Math.cos(angle) * 6}
              y1={Math.sin(angle) * 6}
              x2={Math.cos(angle) * 8.4}
              y2={Math.sin(angle) * 8.4}
            />
          );
        })}
      </g>
    </g>
  );
}

function Moon() {
  return (
    <path
      d={MOON_PATH}
      className="fill-[var(--lm-accent)] stroke-[var(--lm-accent)]"
      fillOpacity={0.25}
      strokeWidth={1.3}
    />
  );
}

function Cloud(props: { offsetY: number }) {
  const parts = CLOUD_PARTS.map(({ kind, ...shape }, index) =>
    kind === "rect" ? (
      <rect key={index} {...shape} />
    ) : (
      <circle key={index} {...shape} />
    )
  );
  return (
    <g transform={`translate(0 ${props.offsetY})`}>
      <g
        className="fill-[var(--lm-ink-hi)] stroke-[var(--lm-ink-hi)]"
        strokeWidth={2.6}
      >
        {parts}
      </g>
      <g className="fill-[var(--lm-recess)] stroke-none">{parts}</g>
    </g>
  );
}

/** Draw the icon for `condition` in a 24-unit box centred on the origin: sun or moon by `isDay`, clouds, rain, snow, fog or a lightning bolt, moving every `motionSeconds` when `animated`. */
export function WeatherGlyph(props: WeatherGlyphProps) {
  const { animated, motionSeconds } = props;
  const sky = props.isDay ? (
    <Sun animated={animated} motionSeconds={motionSeconds} />
  ) : (
    <Moon />
  );
  switch (props.condition) {
    case "clear":
      return sky;
    case "cloudy":
      return (
        <g>
          <g transform="translate(-4 -4.5) scale(0.62)">{sky}</g>
          <Cloud offsetY={1.5} />
        </g>
      );
    case "fog":
      return (
        <g
          className="stroke-[var(--lm-ink-hi)]"
          strokeWidth={1.4}
          strokeLinecap="round"
        >
          {[
            { y: -4, from: -8, to: 7 },
            { y: 0, from: -6, to: 9 },
            { y: 4, from: -9, to: 5 },
          ].map((band, index) => (
            <line
              key={band.y}
              data-lm-motion
              x1={band.from}
              y1={band.y}
              x2={band.to}
              y2={band.y}
              style={
                animated
                  ? {
                      animation: `lm-pulse ${motionSeconds * 2}s ease-in-out ${(index * motionSeconds) / 2}s infinite`,
                    }
                  : undefined
              }
            />
          ))}
        </g>
      );
    case "rain":
      return (
        <g>
          <g
            className="stroke-[var(--lm-ink-hi)]"
            strokeWidth={1.2}
            strokeLinecap="round"
            strokeDasharray="2 1.4"
          >
            {RAIN_DROPS.map((x) => (
              <line
                key={x}
                data-lm-motion
                x1={x + 1}
                y1={3}
                x2={x - 1}
                y2={10}
                style={
                  animated
                    ? {
                        animation: `lm-stream ${motionSeconds}s linear infinite`,
                      }
                    : undefined
                }
              />
            ))}
          </g>
          <Cloud offsetY={-3} />
        </g>
      );
    case "snow":
      return (
        <g>
          <g className="fill-[var(--lm-ink-hi)] stroke-none">
            {SNOW_FLAKES.map((flake, index) => (
              <circle
                key={flake.x}
                data-lm-motion
                cx={flake.x}
                cy={flake.y}
                r={1}
                style={
                  animated
                    ? {
                        animation: `lm-pulse ${motionSeconds * 1.5}s ease-in-out ${(index * motionSeconds) / 2}s infinite`,
                      }
                    : undefined
                }
              />
            ))}
          </g>
          <Cloud offsetY={-3} />
        </g>
      );
    case "thunder":
      return (
        <g>
          <polygon
            points={BOLT_POINTS}
            className="fill-[var(--lm-accent)] stroke-none"
          />
          <Cloud offsetY={-3} />
        </g>
      );
    default: {
      const unhandled: never = props.condition;
      return unhandled;
    }
  }
}
