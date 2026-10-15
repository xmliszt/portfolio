import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { getWeatherParticles } from "@/lib/laundromat/weather/get-weather-particles";

const VISIBLE_DEPTH = { near: 2.5, far: 5.5 };
const PUDDLES = [
  { fromWall: 2.9, along: 0.3, radius: 0.26, ripples: 2 },
  { fromWall: 4.4, along: 0.62, radius: 0.38, ripples: 3 },
  { fromWall: 5.1, along: 0.18, radius: 0.22, ripples: 1 },
  { fromWall: 3.2, along: 0.86, radius: 0.18, ripples: 1 },
];
const RIPPLE_RADIUS = 0.14;
const SPLASHES = getWeatherParticles({ count: 22, seed: 71 });
const RIPPLE_SPOTS = getWeatherParticles({ count: 12, seed: 89 });
const SPLASH_PATH = "M -1.3 0 L -0.7 -1.5 M 0 0 L 0 -2.1 M 1.3 0 L 0.7 -1.5";

type StreetRainProps = {
  wallX: number;
  opening: { near: number; far: number };
  sidewalkWidth: number;
  roadZ: number;
  reflection: string;
  glide: string;
  projection: IsoProjection;
};

/** Draw a wet street seen through the window: a darker sheen, puddles that reflect the sky, rings spreading where drops land in them, and drops splashing on the pavement. */
export function StreetRain(props: StreetRainProps) {
  const { wallX, opening, projection } = props;
  function ground(options: { fromWall: number; along: number }) {
    const x = wallX - options.fromWall;
    return {
      x,
      y:
        opening.near -
        options.fromWall +
        options.along * (opening.far - opening.near),
      z: options.fromWall > props.sidewalkWidth ? props.roadZ : 0,
    };
  }

  return (
    <g data-street-rain className="pointer-events-none">
      {PUDDLES.map((puddle, puddleIndex) => {
        const center = ground(puddle);
        const pool = getIsoEllipse({
          center,
          radius: puddle.radius,
          projection,
        });
        const lobe = getIsoEllipse({
          center: {
            ...center,
            x: center.x - puddle.radius * 0.5,
            y: center.y + puddle.radius * 0.4,
          },
          radius: puddle.radius * 0.6,
          projection,
        });
        return (
          <g key={puddle.fromWall}>
            <g className="fill-[var(--lm-recess)]" opacity={0.55}>
              <ellipse {...pool} />
              <ellipse {...lobe} />
            </g>
            <g
              style={{ fill: props.reflection, transition: props.glide }}
              opacity={0.12}
            >
              <ellipse {...pool} />
              <ellipse {...lobe} />
            </g>
            <ellipse
              cx={pool.cx - pool.rx * 0.3}
              cy={pool.cy - pool.ry * 0.2}
              rx={pool.rx * 0.35}
              ry={pool.ry * 0.18}
              className="fill-[var(--lm-ink-hi)]"
              opacity={0.08}
            />
            {RIPPLE_SPOTS.slice(
              puddleIndex * 3,
              puddleIndex * 3 + puddle.ripples
            ).map((spot) => {
              const ring = getIsoEllipse({
                center: {
                  ...center,
                  x: center.x + (spot.across - 0.5) * puddle.radius,
                  y: center.y + (spot.up - 0.5) * puddle.radius,
                },
                radius: RIPPLE_RADIUS,
                projection,
              });
              const seconds = 1.1 + spot.size * 0.9;
              return (
                <ellipse
                  key={spot.across}
                  {...ring}
                  data-lm-motion
                  className="fill-none stroke-[var(--lm-ink-hi)]"
                  strokeWidth={0.5}
                  opacity={0}
                  style={{
                    transformBox: "fill-box",
                    transformOrigin: "center",
                    animation: `lm-ripple ${seconds}s ease-out -${spot.up * seconds}s infinite`,
                  }}
                />
              );
            })}
          </g>
        );
      })}
      <g
        className="fill-none stroke-[var(--lm-ink-hi)]"
        strokeWidth={0.45}
        strokeLinecap="round"
      >
        {SPLASHES.map((splash) => {
          const point = projectIsoPoint({
            point: ground({
              fromWall:
                VISIBLE_DEPTH.near +
                splash.across * (VISIBLE_DEPTH.far - VISIBLE_DEPTH.near),
              along: splash.up,
            }),
            projection,
          });
          const seconds = 0.7 + splash.size * 1.1;
          return (
            <path
              key={splash.across}
              data-lm-motion
              d={SPLASH_PATH}
              transform={`translate(${point.x} ${point.y})`}
              opacity={0}
              style={{
                animation: `lm-splash ${seconds}s linear -${splash.up * seconds}s infinite`,
              }}
            />
          );
        })}
      </g>
    </g>
  );
}
