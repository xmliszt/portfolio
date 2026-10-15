import { Fragment, useId } from "react";

import { uniqBy } from "lodash";

import { mixHexColors } from "@/lib/laundromat/mix-hex-colors";
import type { GlassCell } from "@/lib/laundromat/weather/get-window-clouds";
import { getWindowClouds } from "@/lib/laundromat/weather/get-window-clouds";

const CLOUD_LAYERS = [
  { key: "far", opacity: 0.7, blur: 0.7, drift: 1.5, seconds: 22 },
  { key: "near", opacity: 0.95, blur: 0.4, drift: 1.5, seconds: 14 },
] as const;
const CLOUD_TONES = {
  fair: {
    day: { lit: "#f4f6f8", shade: "#98a2ae" },
    night: { lit: "#464c58", shade: "#161a21" },
  },
  storm: {
    day: { lit: "#7d848e", shade: "#3a3f47" },
    night: { lit: "#343944", shade: "#0f1216" },
  },
};
const EDGE_GAP_PX = 3;
const BELLY_DEPTH = 6;
const PUFF_MIN_SCALE = 0.82;
const PUFF_SECONDS = { min: 6, spread: 5 };

type WindowCloudsProps = {
  cells: [GlassCell, GlassCell];
  cover: number;
  daylight: number;
  glideMs: number;
};

/** Draw lumpy, lit-from-above clouds in two drifting depth layers inside the glass `cells`, with soft edges and puffs that slowly swell and shrink, darker as `cover` rises and dimmer as `daylight` falls. */
export function WindowClouds(props: WindowCloudsProps) {
  const id = useId();
  const { cover, daylight } = props;
  const { storminess, clouds } = getWindowClouds({
    cover,
    cells: props.cells,
    marginPx:
      EDGE_GAP_PX + Math.max(...CLOUD_LAYERS.map((layer) => layer.drift)),
  });
  function tone(part: "lit" | "shade") {
    function atDaylight(tones: typeof CLOUD_TONES.fair) {
      return mixHexColors({
        from: tones.night[part],
        to: tones.day[part],
        amount: daylight,
      });
    }
    return mixHexColors({
      from: atDaylight(CLOUD_TONES.fair),
      to: atDaylight(CLOUD_TONES.storm),
      amount: storminess,
    });
  }
  const lit = tone("lit");
  const shade = tone("shade");
  const glide = { transition: `stop-color ${props.glideMs}ms` };
  function driftStyle(layer: (typeof CLOUD_LAYERS)[number]) {
    const style: React.CSSProperties & { "--lm-cloud-drift": string } = {
      "--lm-cloud-drift": `${layer.drift}px`,
      animation: `lm-cloud-drift ${layer.seconds}s ease-in-out infinite alternate`,
    };
    return style;
  }
  function puffStyle(index: number) {
    const seconds = PUFF_SECONDS.min + ((index * 2.3) % PUFF_SECONDS.spread);
    const style: React.CSSProperties & { "--lm-puff-from": number } = {
      "--lm-puff-from": PUFF_MIN_SCALE,
      transformBox: "fill-box",
      transformOrigin: "center",
      animation: `lm-cloud-puff ${seconds}s ease-in-out -${(index * 1.7) % seconds}s infinite alternate`,
    };
    return style;
  }

  return (
    <g data-window-clouds>
      <defs>
        <radialGradient id={`${id}-puff`} cx={0.38} cy={0.28} r={0.8}>
          <stop offset={0} style={{ stopColor: lit, ...glide }} />
          <stop
            offset={0.55}
            style={{
              stopColor: mixHexColors({ from: lit, to: shade, amount: 0.45 }),
              ...glide,
            }}
          />
          <stop offset={1} style={{ stopColor: shade, ...glide }} />
        </radialGradient>
        <linearGradient
          id={`${id}-belly`}
          gradientUnits="userSpaceOnUse"
          x1={0}
          y1={-BELLY_DEPTH}
          x2={0}
          y2={0}
        >
          <stop
            offset={0}
            stopOpacity={0}
            style={{ stopColor: shade, ...glide }}
          />
          <stop
            offset={1}
            stopOpacity={0.85}
            style={{ stopColor: shade, ...glide }}
          />
        </linearGradient>
        {uniqBy(clouds, (cloud) => cloud.shapeKey).map((cloud) => {
          const { left, right, top } = cloud.bounds;
          const region = { x: left, y: top, width: right - left, height: -top };
          return (
            <Fragment key={cloud.shapeKey}>
              <clipPath id={`${id}-base-${cloud.shapeKey}`}>
                <rect {...region} />
              </clipPath>
              <mask
                id={`${id}-shape-${cloud.shapeKey}`}
                maskUnits="userSpaceOnUse"
                {...region}
              >
                {cloud.puffs.map((puff, index) => (
                  <circle
                    key={`${puff.x},${puff.y}`}
                    data-lm-motion
                    cx={puff.x}
                    cy={puff.y}
                    r={puff.r}
                    fill="white"
                    style={puffStyle(index)}
                  />
                ))}
              </mask>
            </Fragment>
          );
        })}
        {CLOUD_LAYERS.map((layer) => (
          <filter
            key={layer.key}
            id={`${id}-soft-${layer.key}`}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feGaussianBlur stdDeviation={layer.blur} />
          </filter>
        ))}
      </defs>
      {CLOUD_LAYERS.map((layer) => (
        <g
          key={layer.key}
          data-lm-motion
          opacity={layer.opacity}
          style={driftStyle(layer)}
        >
          <g filter={`url(#${id}-soft-${layer.key})`}>
            {clouds
              .filter((cloud) => cloud.layer === layer.key)
              .map((cloud) => (
                <g
                  key={`${cloud.x},${cloud.y}`}
                  transform={`translate(${cloud.x} ${cloud.y}) scale(${cloud.scale})`}
                >
                  <g clipPath={`url(#${id}-base-${cloud.shapeKey})`}>
                    {cloud.puffs.map((puff, index) => (
                      <circle
                        key={`${puff.x},${puff.y}`}
                        data-lm-motion
                        cx={puff.x}
                        cy={puff.y}
                        r={puff.r}
                        fill={`url(#${id}-puff)`}
                        style={puffStyle(index)}
                      />
                    ))}
                  </g>
                  <rect
                    mask={`url(#${id}-shape-${cloud.shapeKey})`}
                    x={cloud.bounds.left}
                    y={cloud.bounds.top}
                    width={cloud.bounds.right - cloud.bounds.left}
                    height={-cloud.bounds.top}
                    fill={`url(#${id}-belly)`}
                  />
                </g>
              ))}
          </g>
        </g>
      ))}
    </g>
  );
}
