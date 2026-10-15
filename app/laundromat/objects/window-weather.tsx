import { useId } from "react";

import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { getWeatherParticles } from "@/lib/laundromat/weather/get-weather-particles";
import type { WindowWeatherLook } from "@/lib/laundromat/weather/get-window-weather";

const RAIN_SLOPE = 0.23;
const RAIN_LAYERS = [
  {
    seed: 11,
    count: 26,
    length: 3.5,
    width: 0.4,
    opacity: 0.2,
    pace: 1.4,
  },
  {
    seed: 23,
    count: 16,
    length: 6,
    width: 0.6,
    opacity: 0.35,
    pace: 1,
  },
  {
    seed: 37,
    count: 7,
    length: 9,
    width: 0.8,
    opacity: 0.5,
    pace: 0.7,
  },
].map((layer) => ({ ...layer, drops: getWeatherParticles(layer) }));
const SNOW_LAYERS = [
  { seed: 41, count: 22, radius: 0.45, opacity: 0.4, pace: 1.4, delay: 0.4 },
  { seed: 53, count: 12, radius: 0.9, opacity: 0.7, pace: 0.8, delay: 0.8 },
].map((layer) => ({ ...layer, flakes: getWeatherParticles(layer) }));
const CLOUDS = [
  { across: 0.18, up: 0.86, scale: 1 },
  { across: 0.62, up: 0.92, scale: 1.3 },
  { across: 0.9, up: 0.78, scale: 0.8 },
];
const CLOUD_PUFFS = [
  { x: -6, y: 0, rx: 7, ry: 3 },
  { x: 2, y: -2, rx: 7, ry: 4 },
  { x: 8, y: 0.5, rx: 6, ry: 2.6 },
];

type WindowWeatherProps = {
  weather: WindowWeatherLook;
  paneWidth: number;
  paneHeight: number;
  showSky: boolean;
  animated: boolean;
  details: SceneConfig["details"]["window"];
};

/** Draw the weather on a window pane `paneWidth` by `paneHeight`: a tint over the glass, clouds across the sky when `showSky`, and, only when `animated`, falling rain or snow and a lightning flash at each strike. */
export function WindowWeather(props: WindowWeatherProps) {
  const id = useId();
  const { lightningStrikes } = useLocalWeather();
  const { weather, paneWidth, paneHeight, animated, details } = props;
  const { veil, particles } = weather;
  const rainDrift = RAIN_SLOPE * paneHeight;

  function fallStyle(options: {
    seconds: number;
    delay: number;
    driftPx: number;
  }) {
    const style: React.CSSProperties & {
      "--lm-fall-distance": string;
      "--lm-fall-drift": string;
    } = {
      "--lm-fall-distance": `${paneHeight}px`,
      "--lm-fall-drift": `${options.driftPx}px`,
      animation: `lm-weather-fall ${options.seconds}s linear -${options.delay * options.seconds}s infinite`,
    };
    return style;
  }

  return (
    <g data-window-weather pointerEvents="none">
      {veil !== undefined && (
        <>
          <defs>
            <linearGradient id={`${id}-veil`} x1={0} y1={0} x2={0} y2={1}>
              <stop
                offset={0}
                stopOpacity={
                  veil.tone === "light" ? veil.opacity * 0.6 : veil.opacity
                }
                className={
                  veil.tone === "light"
                    ? "[stop-color:var(--lm-ink)]"
                    : "[stop-color:var(--lm-bg)]"
                }
              />
              <stop
                offset={1}
                stopOpacity={veil.opacity}
                className={
                  veil.tone === "light"
                    ? "[stop-color:var(--lm-ink)]"
                    : "[stop-color:var(--lm-bg)]"
                }
              />
            </linearGradient>
          </defs>
          <rect
            width={paneWidth}
            height={paneHeight}
            fill={`url(#${id}-veil)`}
          />
        </>
      )}
      {props.showSky && weather.clouds && (
        <g
          data-lm-motion
          className="fill-[var(--lm-line)]"
          opacity={0.55}
          style={
            animated
              ? {
                  animation:
                    "lm-cloud-drift 14s ease-in-out infinite alternate",
                }
              : undefined
          }
        >
          {CLOUDS.map((cloud) => (
            <g
              key={cloud.across}
              transform={`translate(${cloud.across * paneWidth} ${(1 - cloud.up) * paneHeight}) scale(${cloud.scale})`}
            >
              {CLOUD_PUFFS.map((puff) => (
                <ellipse
                  key={puff.x}
                  cx={puff.x}
                  cy={puff.y}
                  rx={puff.rx}
                  ry={puff.ry}
                />
              ))}
            </g>
          ))}
        </g>
      )}
      {animated &&
        particles === "rain" &&
        RAIN_LAYERS.map((layer) => (
          <g
            key={layer.seed}
            className="stroke-[var(--lm-ink-hi)]"
            strokeWidth={layer.width}
            strokeLinecap="round"
          >
            {layer.drops.map((drop) => {
              const x = drop.across * (paneWidth + rainDrift);
              const length = layer.length * (0.6 + drop.size * 0.8);
              const seconds =
                details.rainFallSeconds * layer.pace * (0.75 + drop.size * 0.5);
              return (
                <g
                  key={drop.across}
                  data-lm-motion
                  opacity={layer.opacity * (0.5 + drop.size * 0.5)}
                  style={fallStyle({
                    seconds,
                    delay: (drop.across * 7.31) % 1,
                    driftPx: -rainDrift,
                  })}
                >
                  {[0, 1].map((tile) => {
                    const top = {
                      x: x + tile * rainDrift,
                      y: drop.up * paneHeight - tile * paneHeight,
                    };
                    return (
                      <line
                        key={tile}
                        x1={top.x}
                        y1={top.y}
                        x2={top.x - RAIN_SLOPE * length}
                        y2={top.y + length}
                      />
                    );
                  })}
                </g>
              );
            })}
          </g>
        ))}
      {animated &&
        particles === "snow" &&
        SNOW_LAYERS.map((layer) => (
          <g
            key={layer.seed}
            data-lm-motion
            style={{
              animation: `lm-snow-sway ${details.snowFallSeconds * layer.pace * 0.3}s ease-in-out -${layer.delay * 3}s infinite alternate`,
            }}
          >
            <g
              data-lm-motion
              className="fill-[var(--lm-ink-hi)]"
              opacity={layer.opacity}
              style={fallStyle({
                seconds: details.snowFallSeconds * layer.pace,
                delay: layer.delay,
                driftPx: 0,
              })}
            >
              {[0, -paneHeight].map((offset) =>
                layer.flakes.map((flake) => (
                  <circle
                    key={`${offset},${flake.across}`}
                    cx={flake.across * paneWidth}
                    cy={flake.up * paneHeight + offset}
                    r={layer.radius * (0.6 + flake.size * 0.8)}
                  />
                ))
              )}
            </g>
          </g>
        ))}
      {weather.lightning && animated && lightningStrikes > 0 && (
        <rect
          key={lightningStrikes}
          data-lm-motion
          width={paneWidth}
          height={paneHeight}
          className="fill-[var(--lm-ink-hi)]"
          opacity={0}
          style={{ animation: "lm-lightning 1.2s ease-out forwards" }}
        />
      )}
    </g>
  );
}
