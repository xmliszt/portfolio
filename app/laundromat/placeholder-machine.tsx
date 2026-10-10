import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import { cn } from "@/lib/utils";

import { PlaceholderObject } from "./placeholder-object";

type PlaceholderMachineProps = {
  laidOut: LaidOutObject;
  highlightedId: string | undefined;
  status: MachineStatus;
  readout: string;
  dialAngleDeg: number;
};

function partStroke(highlighted: boolean) {
  return highlighted ? "stroke-[var(--lm-ink-hi)]" : "stroke-[var(--lm-line)]";
}

export function PlaceholderMachine(props: PlaceholderMachineProps) {
  const { object, machineFace } = props.laidOut;
  if (machineFace === undefined) return null;
  const { dial, start, readout, door } = machineFace.rects;
  const isLive =
    props.status.kind === "running" || props.status.kind === "done";
  const hasLaundry = isLive || props.status.kind === "loaded";
  const dialRadius = Math.min(dial.width, dial.height) / 2 - 3;
  const doorRadius = Math.min(door.width, door.height) / 2;
  return (
    <g data-machine-status={props.status.kind}>
      <PlaceholderObject
        laidOut={props.laidOut}
        highlighted={props.highlightedId === object.id}
      />
      <g
        transform={machineFace.transform}
        className="[&_*]:transition-[stroke] [&_*]:duration-200 [&_*]:[vector-effect:non-scaling-stroke]"
        strokeWidth={1}
      >
        <g
          transform={`translate(${dial.x + dial.width / 2} ${dial.y + dial.height / 2}) rotate(${props.dialAngleDeg})`}
          className={partStroke(props.highlightedId === `${object.id}-dial`)}
        >
          <circle r={dialRadius} className="fill-[var(--lm-face-top)]" />
          <line x1={0} y1={0} x2={dialRadius - 2} y2={0} />
        </g>
        <rect
          x={start.x + start.width * 0.3}
          y={start.y + start.height * 0.3}
          width={start.width * 0.4}
          height={start.height * 0.4}
          rx={2}
          className={cn(
            "fill-[var(--lm-face-top)]",
            partStroke(props.highlightedId === `${object.id}-start`)
          )}
        />
        <text
          x={readout.x + readout.width / 2}
          y={readout.y + readout.height / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={10}
          className={cn(
            "font-[family-name:var(--lm-font-mono)] tabular-nums",
            isLive
              ? "fill-[var(--lm-accent)]"
              : props.status.kind === "loaded"
                ? "fill-[var(--lm-ink-hi)]"
                : "fill-[var(--lm-ink)]"
          )}
        >
          {props.readout}
        </text>
        <circle
          cx={door.x + door.width / 2}
          cy={door.y + door.height / 2}
          r={doorRadius}
          className={cn(
            "fill-[var(--lm-recess)]",
            isLive
              ? "stroke-[var(--lm-accent)]"
              : partStroke(props.highlightedId === `${object.id}-door`),
            props.status.kind === "done" && "motion-safe:animate-pulse"
          )}
        />
        {hasLaundry && (
          <circle
            cx={door.x + door.width / 2}
            cy={door.y + door.height / 2 + doorRadius * 0.35}
            r={doorRadius * 0.5}
            className="fill-[var(--lm-detail)] stroke-none"
          />
        )}
      </g>
    </g>
  );
}
