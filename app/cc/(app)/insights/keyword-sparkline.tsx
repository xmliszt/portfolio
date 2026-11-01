"use client";

import { useState } from "react";

import { formatMetricNumber } from "@/lib/cc/format-metric-number";

type KeywordSparklineProps = {
  term: string;
  values: readonly (number | undefined)[];
  dayLabels: readonly string[];
  postedDayIndexes: readonly number[];
};

const WIDTH = 240;
const HEIGHT = 56;
const PLOT = { left: 4, right: 8, top: 6, bottom: 10 } as const;

export function KeywordSparkline(props: KeywordSparklineProps) {
  const [hoverIndex, setHoverIndex] = useState<number | undefined>(undefined);
  const dayCount = props.values.length;
  const known = props.values.flatMap((value) =>
    value === undefined ? [] : [value]
  );
  const yMax = Math.max(1, ...known);
  const plotWidth = WIDTH - PLOT.left - PLOT.right;
  const plotHeight = HEIGHT - PLOT.top - PLOT.bottom;
  const baseline = PLOT.top + plotHeight;

  function x(index: number) {
    return dayCount <= 1
      ? PLOT.left + plotWidth / 2
      : PLOT.left + (index / (dayCount - 1)) * plotWidth;
  }

  function y(value: number) {
    return baseline - (value / yMax) * plotHeight;
  }

  const segments = props.values.reduce<{ index: number; value: number }[][]>(
    (runs, value, index) => {
      if (value === undefined) return [...runs, []];
      const last = runs.at(-1) ?? [];
      return [...runs.slice(0, -1), [...last, { index, value }]];
    },
    [[]]
  );
  const lastKnownIndex = props.values.findLastIndex(
    (value) => value !== undefined
  );
  const lastKnown =
    lastKnownIndex === -1 ? undefined : props.values[lastKnownIndex];
  const hoverValue =
    hoverIndex === undefined ? undefined : props.values[hoverIndex];

  function handlePointerMove(event: React.PointerEvent<SVGRectElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const index = Math.round(ratio * (dayCount - 1));
    setHoverIndex(Math.min(dayCount - 1, Math.max(0, index)));
  }

  function handlePointerLeave() {
    setHoverIndex(undefined);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`X posts per day for ${props.term} over ${dayCount} days`}
        className="h-auto w-full"
      >
        <line
          x1={PLOT.left}
          x2={WIDTH - PLOT.right}
          y1={baseline}
          y2={baseline}
          className="stroke-border"
          strokeWidth="1"
        />
        <g className="stroke-muted-foreground" strokeWidth="2">
          {props.postedDayIndexes.map((index) => (
            <line
              key={index}
              x1={x(index)}
              x2={x(index)}
              y1={baseline + 2}
              y2={HEIGHT}
            />
          ))}
        </g>
        {hoverIndex !== undefined && (
          <line
            x1={x(hoverIndex)}
            x2={x(hoverIndex)}
            y1={PLOT.top}
            y2={baseline}
            className="stroke-muted-foreground"
            strokeWidth="1"
          />
        )}
        {segments.map((segment) =>
          segment.length > 1 ? (
            <polyline
              key={segment.at(0)?.index}
              fill="none"
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
              className="stroke-primary"
              points={segment
                .map((point) => `${x(point.index)},${y(point.value)}`)
                .join(" ")}
            />
          ) : undefined
        )}
        {segments.map((segment) => {
          const point = segment.at(0);
          return segment.length === 1 && point !== undefined ? (
            <circle
              key={point.index}
              cx={x(point.index)}
              cy={y(point.value)}
              r="2"
              className="fill-primary"
            />
          ) : undefined;
        })}
        {lastKnown !== undefined && (
          <circle
            cx={x(lastKnownIndex)}
            cy={y(lastKnown)}
            r="4"
            strokeWidth="2"
            className="fill-primary stroke-card"
          />
        )}
        {hoverValue !== undefined && hoverIndex !== undefined && (
          <circle
            cx={x(hoverIndex)}
            cy={y(hoverValue)}
            r="4"
            strokeWidth="2"
            className="fill-primary stroke-card"
          />
        )}
        <rect
          x={PLOT.left}
          y={0}
          width={plotWidth}
          height={HEIGHT}
          fill="transparent"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        />
      </svg>
      {hoverIndex !== undefined && (
        <div
          className="bg-background/95 pointer-events-none absolute bottom-full z-10 mb-1 flex flex-col gap-y-0.5 border px-2.5 py-1.5 text-[11px] whitespace-nowrap"
          style={{
            left: `${(x(hoverIndex) / WIDTH) * 100}%`,
            transform:
              x(hoverIndex) > WIDTH / 2 ? "translateX(-100%)" : undefined,
          }}
        >
          <span className="text-muted-foreground">
            {props.dayLabels[hoverIndex]}
          </span>
          <span className="text-foreground font-bold tabular-nums">
            {hoverValue === undefined
              ? "no count"
              : `${formatMetricNumber(hoverValue)} posts`}
          </span>
          {props.postedDayIndexes.includes(hoverIndex) && (
            <span className="text-cc-text-2">You posted</span>
          )}
        </div>
      )}
    </div>
  );
}
