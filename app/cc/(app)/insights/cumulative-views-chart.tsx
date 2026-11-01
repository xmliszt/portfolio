"use client";

import { useState } from "react";

import { formatMetricNumber } from "@/lib/cc/format-metric-number";
import { type PlatformId, PLATFORMS } from "@/lib/cc/platforms";

type CumulativeViewsChartProps = {
  dayLabels: string[];
  series: { platformId: PlatformId; values: number[] }[];
};

const WIDTH = 640;
const HEIGHT = 240;
const PLOT = { left: 48, right: 96, top: 16, bottom: 28 } as const;
const TICK_COUNT = 4;
const DASHED_PLATFORMS: readonly PlatformId[] = ["threads", "reddit"];

const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function getNiceStep(maxValue: number) {
  const rough = Math.max(maxValue, 1) / TICK_COUNT;
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const multiplier = [1, 2, 5, 10].find((step) => step * magnitude >= rough);
  return (multiplier ?? 10) * magnitude;
}

export function CumulativeViewsChart(props: CumulativeViewsChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);
  const dayCount = props.dayLabels.length;
  const step = getNiceStep(
    Math.max(...props.series.flatMap((line) => line.values))
  );
  const yMax = step * TICK_COUNT;
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const labelEvery = Math.ceil(dayCount / 8);

  function x(index: number) {
    return dayCount === 1
      ? PLOT.left + plotWidth / 2
      : PLOT.left + (index / (dayCount - 1)) * plotWidth;
  }

  function y(value: number) {
    return PLOT.top + plotHeight - (value / yMax) * plotHeight;
  }

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const plotX = ((event.clientX - box.left) / box.width) * plotWidth;
    const index =
      dayCount === 1 ? 0 : Math.round((plotX / plotWidth) * (dayCount - 1));
    setHoverIndex(Math.min(dayCount - 1, Math.max(0, index)));
  }

  function handlePointerLeave() {
    setHoverIndex(undefined);
  }

  const hoverRows =
    hoverIndex === undefined
      ? []
      : props.series
          .map((line) => ({
            platformId: line.platformId,
            value: line.values[hoverIndex],
          }))
          .toSorted((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-y-3">
      <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        {props.series.map((line) => (
          <li key={line.platformId} className="flex items-center gap-x-1.5">
            <svg aria-hidden width="16" height="4" className="overflow-visible">
              <line
                x1="0"
                y1="2"
                x2="16"
                y2="2"
                strokeWidth="2"
                strokeDasharray={
                  DASHED_PLATFORMS.includes(line.platformId) ? "4 3" : undefined
                }
                style={{
                  stroke: `hsl(var(${PLATFORMS[line.platformId].colorVar}))`,
                }}
              />
            </svg>
            {PLATFORMS[line.platformId].label}
          </li>
        ))}
      </ul>
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`Cumulative views by platform over ${dayCount} days`}
          className="h-auto w-full"
        >
          <g className="stroke-border" strokeWidth="1">
            {Array.from({ length: TICK_COUNT + 1 }, (_, tick) => (
              <line
                key={tick}
                x1={PLOT.left}
                x2={WIDTH - PLOT.right}
                y1={y(tick * step)}
                y2={y(tick * step)}
              />
            ))}
          </g>
          <g className="fill-muted-foreground text-[10px]">
            {Array.from({ length: TICK_COUNT + 1 }, (_, tick) => (
              <text
                key={tick}
                x={PLOT.left - 8}
                y={y(tick * step) + 3}
                textAnchor="end"
              >
                {compactFormatter.format(tick * step)}
              </text>
            ))}
            {props.dayLabels.map((label, index) =>
              index % labelEvery === 0 ? (
                <text
                  key={index}
                  x={x(index)}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                >
                  {label}
                </text>
              ) : undefined
            )}
          </g>
          {hoverIndex !== undefined && (
            <line
              x1={x(hoverIndex)}
              x2={x(hoverIndex)}
              y1={PLOT.top}
              y2={PLOT.top + plotHeight}
              className="stroke-muted-foreground"
              strokeWidth="1"
            />
          )}
          {props.series.map((line) => {
            const color = `hsl(var(${PLATFORMS[line.platformId].colorVar}))`;
            const lastIndex = line.values.length - 1;
            return (
              <g key={line.platformId}>
                <polyline
                  fill="none"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeDasharray={
                    DASHED_PLATFORMS.includes(line.platformId)
                      ? "6 4"
                      : undefined
                  }
                  style={{ stroke: color }}
                  points={line.values
                    .map((value, index) => `${x(index)},${y(value)}`)
                    .join(" ")}
                />
                <circle
                  cx={x(lastIndex)}
                  cy={y(line.values[lastIndex])}
                  r="4"
                  strokeWidth="2"
                  className="stroke-card"
                  style={{ fill: color }}
                />
                {hoverIndex !== undefined && (
                  <circle
                    cx={x(hoverIndex)}
                    cy={y(line.values[hoverIndex])}
                    r="4"
                    strokeWidth="2"
                    className="stroke-card"
                    style={{ fill: color }}
                  />
                )}
              </g>
            );
          })}
          {props.series.length <= 4 &&
            props.series.map((line) => (
              <text
                key={line.platformId}
                x={x(dayCount - 1) + 8}
                y={y(line.values[line.values.length - 1]) + 3}
                className="fill-cc-text-2 text-[10px]"
              >
                {PLATFORMS[line.platformId].shortLabel}{" "}
                {compactFormatter.format(line.values[line.values.length - 1])}
              </text>
            ))}
          <rect
            x={PLOT.left}
            y={PLOT.top}
            width={plotWidth}
            height={plotHeight}
            fill="transparent"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        </svg>
        {hoverIndex !== undefined && (
          <div
            className="bg-background/95 pointer-events-none absolute top-2 flex flex-col gap-y-1 border px-3 py-2 text-[11px]"
            style={{
              left: `${(x(hoverIndex) / WIDTH) * 100}%`,
              transform:
                x(hoverIndex) > WIDTH / 2
                  ? "translateX(calc(-100% - 12px))"
                  : "translateX(12px)",
            }}
          >
            <span className="text-muted-foreground">
              {props.dayLabels[hoverIndex]}
            </span>
            {hoverRows.map((row) => (
              <span key={row.platformId} className="flex items-center gap-x-2">
                <span
                  aria-hidden
                  className="h-0.5 w-3"
                  style={{
                    background: `hsl(var(${PLATFORMS[row.platformId].colorVar}))`,
                  }}
                />
                <span className="text-foreground font-bold tabular-nums">
                  {formatMetricNumber(row.value)}
                </span>
                <span className="text-muted-foreground">
                  {PLATFORMS[row.platformId].label}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
