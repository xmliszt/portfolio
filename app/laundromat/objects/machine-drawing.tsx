import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import { partStroke } from "./part-stroke";
import type { MachineView } from "./scene-views";

const DRUM_RIBS = [0, 120, 240];
const LOAD_BLOBS = [
  "M -7 3 C -6 -1 -1 -2 1 1 C 4 -2 8 0 7 4 C 5 8 -5 8 -7 3 Z",
  "M -3 -5 C 0 -8 5 -6 4 -2 C 3 1 -2 1 -3 -1 Z",
];

type MachineDrawingProps = {
  laidOut: LaidOutObject;
  highlightedId: string | undefined;
  view: MachineView;
  machineCycles: number[];
  details: SceneConfig["details"]["machine"];
};

export function MachineDrawing(props: MachineDrawingProps) {
  const { object, faces, face } = props.laidOut;
  if (face?.target !== "machine") return null;
  const { details, view } = props;
  const isDryer = object.kind === "dryer";
  const { panel, dial, readout, start, band, door, body } = face.rects;
  const isRunning = view.status.kind === "running";
  const isLive = isRunning || view.status.kind === "done";
  const hasLaundry = isLive || view.status.kind === "loaded";
  function isHighlighted(part: string) {
    return props.highlightedId === `${object.id}-${part}`;
  }
  const dialCenter = {
    x: dial.x + dial.width / 2,
    y: dial.y + dial.height / 2,
  };
  const dialRadius = Math.min(dial.width, dial.height) / 2 - 3;
  const doorCenter = {
    x: door.x + door.width / 2,
    y: door.y + door.height / 2,
  };
  const doorRadius = door.width / 2;
  const hingeX = door.x - 1.5;
  const doorAngle = (view.doorOpen ? details.doorOpenDeg : 0) * (Math.PI / 180);
  const doorSwing = `translate(${hingeX}px, 0px) matrix(${Math.cos(doorAngle) - Math.sin(doorAngle)}, ${Math.sin(doorAngle)}, 0, 1, 0, 0) translate(${-hingeX}px, 0px)`;
  const ticks = props.machineCycles.map((_, index) => -90 + index * 60);

  return (
    <g data-machine-status={view.status.kind} strokeLinejoin="round">
      <g className={partStroke(props.highlightedId === object.id)}>
        <polygon
          className="fill-[var(--lm-face)]"
          points={toSvgPoints(faces.front)}
        />
        <polygon
          className="fill-[var(--lm-wall)]"
          points={toSvgPoints(faces.side)}
        />
        <polygon
          className="fill-[var(--lm-face-top)]"
          points={toSvgPoints(faces.top)}
        />
      </g>
      <g
        transform={face.transform}
        className="[&_*]:transition-[stroke] [&_*]:duration-200"
        strokeWidth={1}
      >
        <rect
          x={body.x + 2}
          y={body.y + 2}
          width={body.width - 4}
          height={body.height - 4}
          rx={2}
          className="fill-none stroke-[var(--lm-detail)]"
        />
        <rect
          {...panel}
          rx={1.5}
          className="fill-[var(--lm-face-top)] stroke-[var(--lm-detail)]"
        />
        <g transform={`translate(${dialCenter.x} ${dialCenter.y})`}>
          {isHighlighted("dial") && (
            <circle
              r={dialRadius + 2.5}
              className="fill-none stroke-[var(--lm-ink)]"
              strokeOpacity={0.4}
            />
          )}
          {ticks.map((angle) => (
            <line
              key={angle}
              x1={0}
              y1={-dialRadius - 1.5}
              x2={0}
              y2={-dialRadius + 0.5}
              transform={`rotate(${angle + 90})`}
              className="stroke-[var(--lm-ink)]"
              strokeWidth={0.75}
            />
          ))}
          <circle
            r={dialRadius - 2}
            className={cn(
              "fill-[var(--lm-face)]",
              partStroke(isHighlighted("dial"))
            )}
          />
          <circle
            r={dialRadius - 4}
            className="fill-none stroke-[var(--lm-detail)]"
            strokeWidth={0.75}
          />
          <g
            data-lm-motion
            style={{
              transform: `rotate(${view.dialAngleDeg}deg)`,
              transition: `transform ${details.dialSettleMs}ms cubic-bezier(0.2, 0.9, 0.3, 1.15)`,
            }}
          >
            <line
              x1={0}
              y1={0}
              x2={dialRadius - 3}
              y2={0}
              className={partStroke(isHighlighted("dial"))}
              strokeWidth={1.25}
            />
          </g>
        </g>
        <rect
          {...readout}
          rx={1}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        />
        {isLive && (
          <rect
            {...readout}
            rx={1}
            className="fill-[var(--lm-accent)] stroke-none"
            opacity={details.displayGlow * 0.2}
          />
        )}
        <text
          x={readout.x + readout.width / 2}
          y={readout.y + readout.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={9}
          className={cn(
            "stroke-none font-[family-name:var(--lm-font-mono)] tabular-nums",
            isLive
              ? "fill-[var(--lm-accent)]"
              : view.status.kind === "loaded"
                ? "fill-[var(--lm-ink-hi)]"
                : "fill-[var(--lm-ink)]"
          )}
        >
          {view.readout}
        </text>
        <g
          transform={`translate(${start.x + start.width / 2} ${start.y + start.height / 2})`}
        >
          {isHighlighted("start") && (
            <rect
              x={-12}
              y={-7.5}
              width={24}
              height={15}
              rx={3}
              className="fill-none stroke-[var(--lm-ink)]"
              strokeOpacity={0.4}
            />
          )}
          <rect
            x={-8}
            y={-4.5}
            width={16}
            height={9}
            rx={2.5}
            className={cn(
              "fill-[var(--lm-face)]",
              partStroke(isHighlighted("start"))
            )}
          />
          <rect
            x={-6.5}
            y={-3}
            width={13}
            height={6}
            rx={1.5}
            className="fill-none stroke-[var(--lm-detail)]"
            strokeWidth={0.75}
          />
          <circle
            cx={11}
            cy={0}
            r={1.2}
            className={cn(
              "stroke-none",
              isRunning ? "fill-[var(--lm-accent)]" : "fill-[var(--lm-detail)]"
            )}
          />
        </g>
        {isDryer ? (
          <g strokeWidth={0.75}>
            <rect
              x={band.x + 4}
              y={band.y + band.height / 2 - 1.5}
              width={band.width * 0.5}
              height={3}
              rx={1.5}
              className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
            />
            <g
              transform={`translate(${band.x + band.width - 8} ${band.y + band.height / 2})`}
            >
              <circle
                r={3.2}
                className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
              />
              <line
                x1={0}
                y1={0}
                x2={-2}
                y2={-2}
                className="stroke-[var(--lm-ink)]"
              />
              {[-130, -90, -50].map((angle) => (
                <line
                  key={angle}
                  x1={0}
                  y1={-4.4}
                  x2={0}
                  y2={-5.4}
                  transform={`rotate(${angle + 90})`}
                  className="stroke-[var(--lm-detail)]"
                />
              ))}
            </g>
          </g>
        ) : (
          <g strokeWidth={0.75}>
            <rect
              x={band.x + 2}
              y={band.y + 2}
              width={band.width * 0.48}
              height={band.height - 4}
              rx={1}
              className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
            />
            <line
              x1={band.x + band.width * 0.16}
              y1={band.y + band.height - 4.5}
              x2={band.x + band.width * 0.34}
              y2={band.y + band.height - 4.5}
              className="stroke-[var(--lm-detail)]"
              strokeWidth={1.5}
            />
            {[0.17, 0.33].map((at) => (
              <line
                key={at}
                x1={band.x + 2 + band.width * 0.48 * at * 1.5}
                y1={band.y + 3}
                x2={band.x + 2 + band.width * 0.48 * at * 1.5}
                y2={band.y + 6}
                className="stroke-[var(--lm-detail)]"
              />
            ))}
            <rect
              x={band.x + band.width - 14}
              y={band.y + 2.5}
              width={11}
              height={band.height - 5}
              rx={1}
              className="fill-[var(--lm-face-top)] stroke-[var(--lm-detail)]"
            />
            <rect
              x={band.x + band.width - 9.5}
              y={band.y + 4.5}
              width={2}
              height={band.height - 9}
              className="fill-[var(--lm-recess)] stroke-[var(--lm-line)]"
            />
          </g>
        )}
        <circle
          cx={doorCenter.x}
          cy={doorCenter.y}
          r={doorRadius - 4}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        />
        <g
          data-lm-motion
          style={{
            transform: doorSwing,
            transition: `transform ${details.doorSwingMs}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
          }}
        >
          {[0.22, 0.78].map((at) => (
            <rect
              key={at}
              x={hingeX - 1.5}
              y={door.y + door.height * at - 3}
              width={3}
              height={6}
              rx={0.75}
              className="fill-[var(--lm-face-top)] stroke-[var(--lm-line)]"
              strokeWidth={0.75}
            />
          ))}
          <circle
            cx={doorCenter.x}
            cy={doorCenter.y}
            r={doorRadius}
            className={cn(
              "fill-[var(--lm-face-top)]",
              isLive
                ? "stroke-[var(--lm-accent)]"
                : partStroke(isHighlighted("door"))
            )}
            style={
              view.status.kind === "done"
                ? { animation: "lm-pulse 2.4s ease-in-out infinite" }
                : undefined
            }
          />
          <circle
            cx={doorCenter.x}
            cy={doorCenter.y}
            r={doorRadius - 2.5}
            className="fill-none stroke-[var(--lm-ink)]"
            strokeOpacity={0.5}
            strokeWidth={0.75}
          />
          <circle
            cx={doorCenter.x}
            cy={doorCenter.y}
            r={doorRadius - 4.5}
            className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          />
          <g transform={`translate(${doorCenter.x} ${doorCenter.y})`}>
            {isDryer && isRunning && (
              <circle
                r={doorRadius - 6}
                className="fill-[var(--lm-accent)] stroke-none"
                opacity={details.dryerGlow}
              />
            )}
            <g
              data-lm-motion
              style={
                isRunning
                  ? {
                      animation: `lm-spin ${details.drumSecondsPerTurn}s linear infinite`,
                    }
                  : undefined
              }
            >
              <circle
                r={doorRadius - 7}
                className="fill-none stroke-[var(--lm-detail)]"
                strokeWidth={0.75}
                strokeDasharray="1.5 2.5"
              />
              {DRUM_RIBS.map((angle) => (
                <path
                  key={angle}
                  d={`M -1.6 ${-(doorRadius - 7)} L 0 ${-(doorRadius - 10.5)} L 1.6 ${-(doorRadius - 7)}`}
                  transform={`rotate(${angle})`}
                  className="fill-[var(--lm-face)] stroke-[var(--lm-detail)]"
                  strokeWidth={0.75}
                />
              ))}
              {hasLaundry && (
                <g
                  transform={`translate(0 ${doorRadius * 0.28})`}
                  opacity={details.tumbleOpacity}
                  className="fill-[var(--lm-detail)] stroke-[var(--lm-line)]"
                  strokeWidth={0.75}
                >
                  {LOAD_BLOBS.map((blob) => (
                    <path key={blob} d={blob} />
                  ))}
                </g>
              )}
            </g>
            <path
              d={`M ${-(doorRadius - 9)} -2 A ${doorRadius - 9} ${doorRadius - 9} 0 0 1 -2 ${-(doorRadius - 9)}`}
              className="fill-none stroke-[var(--lm-ink-hi)]"
              strokeOpacity={0.18}
              strokeWidth={1}
            />
          </g>
          {isHighlighted("door") && !isLive && (
            <circle
              cx={doorCenter.x}
              cy={doorCenter.y}
              r={doorRadius + 2.5}
              className="fill-none stroke-[var(--lm-ink)]"
              strokeOpacity={0.4}
            />
          )}
        </g>
      </g>
    </g>
  );
}
