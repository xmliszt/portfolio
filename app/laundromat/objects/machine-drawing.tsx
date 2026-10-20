import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getDialAngleDeg } from "@/lib/laundromat/laundry/get-dial-angle-deg";
import { LITE_DRUM_POSES } from "@/lib/laundromat/render-quality/lite-drum-poses";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import { BoxBevel } from "./box-bevel";
import { DrumLaundry } from "./drum-laundry";
import { GoldenMachineGlow } from "./golden-machine-glow";
import { GoldenWashGlow } from "./golden-wash-glow";
import { GoldenWashSparkles } from "./golden-wash-sparkles";
import { MachineDoorSwing } from "./machine-door-swing";
import { partStroke } from "./part-stroke";
import type { MachineView } from "./scene-views";

const DRUM_RIBS = [0, 120, 240];
const SIDE_LOUVERS = [2, 3, 4, 5];
const LOUVER_PITCH = 6;

function getRingPath(options: {
  center: { x: number; y: number };
  outerRadius: number;
  innerRadius: number;
}) {
  const { center } = options;
  return [options.outerRadius, options.innerRadius]
    .map(
      (radius) =>
        `M ${center.x - radius} ${center.y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0 Z`
    )
    .join(" ");
}

type MachineDrawingProps = {
  laidOut: LaidOutObject;
  highlightedId: string | undefined;
  view: MachineView;
  machineCycles: number[];
  details: SceneConfig["details"]["machine"];
};

export function MachineDrawing(props: MachineDrawingProps) {
  const { quality } = useRenderQuality();
  const { object, faces, face } = props.laidOut;
  if (face?.target !== "machine") return null;
  const isLite = quality === "lite";
  const { details, view } = props;
  const isDryer = object.kind === "dryer";
  const { panel, dial, readout, start, band, door, body, plinth } = face.rects;
  const isSomeoneElses = view.status.kind === "occupied";
  const isRunning =
    view.status.kind === "running" ||
    (view.status.kind === "occupied" && view.status.phase === "running");
  const isLive = view.status.kind === "running" || view.status.kind === "done";
  const isGolden = view.goldenWash === "running";
  const isInvited = view.goldenWash === "invited";
  const remainingMs =
    view.status.kind === "running" ||
    (view.status.kind === "occupied" && view.status.phase === "running")
      ? view.status.remainingMs
      : undefined;
  const liteDrumDeg =
    remainingMs === undefined
      ? 0
      : -(Math.floor(remainingMs / 1000) % LITE_DRUM_POSES) *
        (360 / LITE_DRUM_POSES);
  const hasLaundry = isLive || isSomeoneElses || view.status.kind === "loaded";
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
  const ticks = props.machineCycles.map((_, detent) =>
    getDialAngleDeg({ detent, detentCount: props.machineCycles.length })
  );

  return (
    <g data-machine-status={view.status.kind} strokeLinejoin="round">
      <g className={partStroke(props.highlightedId === object.id || isInvited)}>
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
        <BoxBevel points={faces.bevel} />
        {face.sidePlinth.length > 0 && (
          <polygon
            className="fill-[var(--lm-recess)]"
            points={toSvgPoints(face.sidePlinth)}
          />
        )}
      </g>
      <g transform={face.sideTransform} strokeWidth={0.75}>
        <rect
          {...face.sidePanel}
          rx={2}
          className="fill-none stroke-[var(--lm-detail)]"
        />
        {SIDE_LOUVERS.map((at) => (
          <rect
            key={at}
            x={face.sidePanel.x + face.sidePanel.width * 0.2}
            y={face.sidePanel.y + face.sidePanel.height - at * LOUVER_PITCH}
            width={face.sidePanel.width * 0.6}
            height={LOUVER_PITCH / 2}
            rx={LOUVER_PITCH / 4}
            className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          />
        ))}
        {[0, 1].flatMap((column) =>
          [0, 1].map((row) => (
            <circle
              key={`${column},${row}`}
              cx={
                face.sidePanel.x +
                column * face.sidePanel.width +
                (column === 0 ? 5 : -5)
              }
              cy={
                face.sidePanel.y +
                row * face.sidePanel.height +
                (row === 0 ? 5 : -5)
              }
              r={0.9}
              className="fill-[var(--lm-detail)] stroke-[var(--lm-line)]"
              strokeWidth={0.4}
            />
          ))
        )}
      </g>
      <g
        transform={face.transform}
        className="[&_*]:transition-[stroke] [&_*]:duration-200"
        strokeWidth={1}
      >
        {plinth.height > 0 && (
          <>
            <rect {...plinth} className="fill-[var(--lm-recess)] stroke-none" />
            <line
              x1={plinth.x}
              y1={plinth.y}
              x2={plinth.x + plinth.width}
              y2={plinth.y}
              className={partStroke(props.highlightedId === object.id)}
            />
          </>
        )}
        <rect
          x={body.x + 2}
          y={body.y + 2}
          width={body.width - 4}
          height={body.height - 4 - plinth.height}
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
              : view.status.kind === "loaded" || isSomeoneElses
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
        <g transform={`translate(${doorCenter.x} ${doorCenter.y})`}>
          {isDryer && isRunning && (
            <circle
              r={doorRadius - 6}
              className="fill-[var(--lm-accent)] stroke-none"
              opacity={details.dryerGlow}
            />
          )}
          {isGolden && <GoldenWashGlow radius={doorRadius - 6} />}
          {hasLaundry && (
            <DrumLaundry
              radius={doorRadius - 7}
              running={isRunning && !isLite}
              wet={!isDryer}
              secondsPerTurn={details.drumSecondsPerTurn}
            />
          )}
          <g
            data-lm-motion
            style={
              !isRunning
                ? undefined
                : isLite
                  ? { transform: `rotate(${liteDrumDeg}deg)` }
                  : {
                      animation: `lm-spin ${details.drumSecondsPerTurn}s linear infinite`,
                    }
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
          </g>
        </g>
        <MachineDoorSwing
          hingeX={hingeX}
          open={view.doorOpen}
          openDeg={details.doorOpenDeg}
          swingMs={details.doorSwingMs}
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
          <path
            d={getRingPath({
              center: doorCenter,
              outerRadius: doorRadius,
              innerRadius: doorRadius - 4.5,
            })}
            fillRule="evenodd"
            data-lm-motion
            className={cn(
              "fill-[var(--lm-face-top)]",
              isLive || isGolden
                ? "stroke-[var(--lm-accent)]"
                : partStroke(isHighlighted("door") || isInvited)
            )}
            style={
              (view.status.kind === "done" || isInvited) && !isLite
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
            fillOpacity={details.tumbleOpacity}
          />
          <path
            d={`M ${doorCenter.x - (doorRadius - 9)} ${doorCenter.y - 2} A ${doorRadius - 9} ${doorRadius - 9} 0 0 1 ${doorCenter.x - 2} ${doorCenter.y - (doorRadius - 9)}`}
            className="fill-none stroke-[var(--lm-ink-hi)]"
            strokeOpacity={0.18}
            strokeWidth={1}
          />
          {isHighlighted("door") && !isLive && (
            <circle
              cx={doorCenter.x}
              cy={doorCenter.y}
              r={doorRadius + 2.5}
              className="fill-none stroke-[var(--lm-ink)]"
              strokeOpacity={0.4}
            />
          )}
        </MachineDoorSwing>
        {isGolden && (
          <GoldenWashSparkles
            center={doorCenter}
            radius={doorRadius}
            animated={!isLite}
          />
        )}
      </g>
      {isGolden && <GoldenMachineGlow faces={faces} animated={!isLite} />}
    </g>
  );
}
