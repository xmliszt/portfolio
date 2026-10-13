import {
  BOARD_POSTER_SIZE,
  BoardPoster,
} from "@/app/laundromat/board/board-poster";
import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { getBoardEntries } from "@/lib/laundromat/board/get-board-entries";
import { getBoardFrame } from "@/lib/laundromat/board/get-board-frame";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type {
  IsoProjection,
  ScreenPoint,
} from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import { partStroke } from "./part-stroke";

type Segment = { from: ScreenPoint; to: ScreenPoint };

type BoardDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  backlit: boolean;
  details: SceneConfig["details"]["board"];
};

export function BoardDrawing(props: BoardDrawingProps) {
  const { copy } = useLaundromatCopy();
  const { projection, details } = props;
  const { object } = props.laidOut;
  const frame = getBoardFrame({
    position: object.position,
    size: object.size,
    leanDeg: details.leanDeg,
    projection,
  });
  const { screen, chin, body } = frame.face.rects;
  const poster = {
    x: screen.x + 1,
    y: screen.y + 1,
    width: screen.width - 2,
    height: screen.height - 2,
  };
  const posterScale = Math.min(
    poster.width / BOARD_POSTER_SIZE.width,
    poster.height / BOARD_POSTER_SIZE.height
  );
  const entries = getBoardEntries({ copy, count: details.visibleUpdates });
  const spill = getIsoEllipse({
    center: frame.floorSpill.center,
    radius: frame.floorSpill.radius,
    projection,
  });
  const posterClipId = `${object.id}-poster`;
  const spillId = `${object.id}-spill`;
  const cableFadeId = `${object.id}-cable`;
  const screwCorners = [
    { x: body.x + 2, y: body.y + 2 },
    { x: body.x + body.width - 2, y: body.y + 2 },
    { x: body.x + 2, y: body.y + body.height - 2 },
    { x: body.x + body.width - 2, y: body.y + body.height - 2 },
  ];
  const stroke = partStroke(props.highlighted);

  function bar(options: {
    segment: Segment;
    widthPx: number;
    fill: string;
    rounded?: boolean;
  }) {
    const { from, to } = options.segment;
    const linecap = options.rounded === true ? "round" : "butt";
    return (
      <g key={`${from.x},${from.y},${to.x},${to.y}`}>
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          className={stroke}
          strokeWidth={options.widthPx + 1.5}
          strokeLinecap={linecap}
        />
        <line
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          className={options.fill}
          strokeWidth={options.widthPx}
          strokeLinecap={linecap}
        />
      </g>
    );
  }

  function footBar(segment: Segment) {
    return (
      <g>
        {bar({
          segment,
          widthPx: 2 * frame.footRadiusPx,
          fill: "stroke-[var(--lm-shade-1)]",
        })}
        {[segment.from, segment.to].map((end) => (
          <ellipse
            key={`${end.x},${end.y}`}
            cx={end.x}
            cy={end.y}
            rx={frame.footRadiusPx * 0.75}
            ry={frame.footRadiusPx}
            className={cn("fill-[var(--lm-recess)]", stroke)}
            strokeWidth={0.75}
          />
        ))}
      </g>
    );
  }

  return (
    <g data-board strokeLinejoin="round">
      <defs>
        <radialGradient id={spillId}>
          <stop offset="0%" stopColor="var(--lm-accent)" stopOpacity={1} />
          <stop offset="100%" stopColor="var(--lm-accent)" stopOpacity={0} />
        </radialGradient>
        <linearGradient
          id={cableFadeId}
          gradientUnits="userSpaceOnUse"
          x1={frame.cable.bend.x}
          y1={frame.cable.bend.y}
          x2={frame.cable.to.x}
          y2={frame.cable.to.y}
        >
          <stop offset="0%" stopColor="var(--lm-line)" stopOpacity={1} />
          <stop offset="100%" stopColor="var(--lm-line)" stopOpacity={0} />
        </linearGradient>
        <clipPath id={posterClipId}>
          <rect {...poster} rx={1} />
        </clipPath>
      </defs>
      <ellipse
        {...spill}
        fill={`url(#${spillId})`}
        className="transition-opacity duration-700"
        opacity={props.backlit ? details.floorSpill : 0}
      />
      {footBar(frame.footBars.rear)}
      {frame.rearRails.map((segment) =>
        bar({
          segment,
          widthPx: frame.railWidthPx,
          fill: "stroke-[var(--lm-wall)]",
        })
      )}
      {bar({
        segment: frame.rearBrace,
        widthPx: frame.railWidthPx * 0.8,
        fill: "stroke-[var(--lm-wall)]",
      })}
      {frame.stretchers.map((segment) => (
        <g key={`${segment.to.x},${segment.to.y}`}>
          {bar({
            segment,
            widthPx: frame.railWidthPx * 0.7,
            fill: "stroke-[var(--lm-shade-1)]",
          })}
          {[segment.from, segment.to].map((end) => (
            <circle
              key={`${end.x},${end.y}`}
              cx={end.x}
              cy={end.y}
              r={0.55}
              className="fill-[var(--lm-face-top)] stroke-[var(--lm-detail)]"
              strokeWidth={0.4}
            />
          ))}
        </g>
      ))}
      <path
        d={`M ${frame.cable.from.x} ${frame.cable.from.y} Q ${frame.cable.bend.x} ${frame.cable.bend.y + 4} ${frame.cable.bend.x} ${frame.cable.bend.y} T ${frame.cable.to.x} ${frame.cable.to.y}`}
        className="fill-none"
        stroke={`url(#${cableFadeId})`}
        strokeWidth={1}
        strokeLinecap="round"
      />
      {footBar(frame.footBars.front)}
      {frame.frontRails.map((segment) =>
        bar({
          segment,
          widthPx: frame.railWidthPx,
          fill: "stroke-[var(--lm-shade-2)]",
        })
      )}
      <g className={stroke} strokeWidth={1}>
        <polygon
          className="fill-[var(--lm-face-top)]"
          points={toSvgPoints(frame.panel.top)}
        />
        <polygon
          className="fill-[var(--lm-wall)]"
          points={toSvgPoints(frame.panel.side)}
        />
        <polygon
          className="fill-[var(--lm-face)]"
          points={toSvgPoints(frame.panel.front)}
        />
      </g>
      <g className="stroke-[var(--lm-detail)]" strokeWidth={0.5}>
        {[frame.panel.sideSeam, frame.panel.topSeam].map(({ from, to }) => (
          <line
            key={`${from.x},${from.y}`}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
          />
        ))}
      </g>
      {frame.hinges.map((segment) => (
        <g key={`${segment.from.x},${segment.from.y}`}>
          {bar({
            segment,
            widthPx: frame.railWidthPx * 1.2,
            fill: "stroke-[var(--lm-face-top)]",
            rounded: true,
          })}
          <circle
            cx={(segment.from.x + segment.to.x) / 2}
            cy={(segment.from.y + segment.to.y) / 2}
            r={0.5}
            className="fill-[var(--lm-detail)] stroke-none"
          />
        </g>
      ))}
      <g transform={frame.face.transform}>
        <rect
          x={body.x + 1.2}
          y={body.y + 1.2}
          width={body.width - 2.4}
          height={body.height - 2.4}
          rx={1.5}
          className="fill-none stroke-[var(--lm-detail)]"
          strokeWidth={0.5}
        />
        {screwCorners.map((corner) => (
          <g key={`${corner.x},${corner.y}`}>
            <circle
              cx={corner.x}
              cy={corner.y}
              r={0.85}
              className="fill-none stroke-[var(--lm-detail)]"
              strokeWidth={0.3}
            />
            <circle
              cx={corner.x}
              cy={corner.y}
              r={0.45}
              className="fill-[var(--lm-line)] stroke-none"
            />
          </g>
        ))}
        <rect
          {...screen}
          rx={1}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.6}
        />
        <g clipPath={`url(#${posterClipId})`}>
          <g
            transform={`translate(${poster.x + (poster.width - BOARD_POSTER_SIZE.width * posterScale) / 2} ${poster.y + (poster.height - BOARD_POSTER_SIZE.height * posterScale) / 2}) scale(${posterScale})`}
          >
            <BoardPoster copy={copy} entries={entries} />
          </g>
          <rect
            {...poster}
            className="fill-[var(--lm-recess)] transition-opacity duration-700"
            opacity={props.backlit ? 0 : details.dayShade}
          />
          <rect
            {...poster}
            className="fill-[var(--lm-accent-hi)] transition-opacity duration-700"
            opacity={props.backlit ? details.frontlight : 0}
          />
        </g>
        <text
          x={chin.x + chin.width / 2}
          y={chin.y + chin.height / 2 + 0.9}
          fontSize={2.2}
          textAnchor="middle"
          className="fill-[var(--lm-detail)] font-[family-name:var(--lm-font-mono)] lowercase"
        >
          {copy.site.name}
        </text>
        <circle
          cx={chin.x + chin.width - 2}
          cy={chin.y + chin.height / 2}
          r={0.7}
          className={
            props.backlit
              ? "fill-[var(--lm-accent)]"
              : "fill-[var(--lm-detail)]"
          }
        />
        <circle
          cx={chin.x + 2}
          cy={chin.y + chin.height / 2}
          r={0.9}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.3}
        />
      </g>
    </g>
  );
}
