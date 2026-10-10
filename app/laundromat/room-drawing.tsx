import type { SceneLayout } from "@/lib/laundromat/build-scene-layout";
import type { MachineStatus } from "@/lib/laundromat/laundry/get-machine-status";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { PlaceholderMachine } from "./placeholder-machine";
import { PlaceholderObject } from "./placeholder-object";

type RoomDrawingProps = {
  layout: SceneLayout;
  highlightedId: string | undefined;
  focusedObjectId: string | undefined;
  dimAmount: number;
  machineViews: {
    [objectId: string]: {
      status: MachineStatus;
      readout: string;
      dialAngleDeg: number;
    };
  };
};

export function RoomDrawing(props: RoomDrawingProps) {
  const { layout } = props;
  const focused = layout.objects.find(
    ({ object }) => object.id === props.focusedObjectId
  );
  return (
    <svg
      aria-hidden
      width={layout.size.width}
      height={layout.size.height}
      viewBox={`0 0 ${layout.size.width} ${layout.size.height}`}
      className="pointer-events-none absolute top-0 left-0 overflow-visible"
    >
      <g
        className="stroke-[var(--lm-line)] [&_*]:[vector-effect:non-scaling-stroke]"
        strokeWidth={1}
        strokeLinejoin="round"
      >
        <polygon
          className="fill-[var(--lm-wall-2)]"
          points={toSvgPoints(layout.leftWall)}
        />
        <polygon
          className="fill-[var(--lm-wall)]"
          points={toSvgPoints(layout.backWall)}
        />
        <polygon
          className="fill-[var(--lm-face-top)]"
          points={toSvgPoints(layout.floor)}
        />
        <g className="stroke-[var(--lm-detail)]">
          {layout.gridLines.map((line) => (
            <line
              key={`${line.from.x},${line.from.y}`}
              x1={line.from.x}
              y1={line.from.y}
              x2={line.to.x}
              y2={line.to.y}
            />
          ))}
        </g>
      </g>
      {layout.objects.map((laidOut) => {
        const view = props.machineViews[laidOut.object.id];
        return view === undefined ? (
          <PlaceholderObject
            key={laidOut.object.id}
            laidOut={laidOut}
            highlighted={laidOut.object.id === props.highlightedId}
          />
        ) : (
          <PlaceholderMachine
            key={laidOut.object.id}
            laidOut={laidOut}
            highlightedId={props.highlightedId}
            status={view.status}
            readout={view.readout}
            dialAngleDeg={view.dialAngleDeg}
          />
        );
      })}
      <rect
        width={layout.size.width}
        height={layout.size.height}
        className="fill-[var(--lm-bg)] transition-opacity duration-500"
        opacity={focused === undefined ? 0 : props.dimAmount}
      />
      {focused !== undefined && (
        <PlaceholderObject
          laidOut={focused}
          highlighted={focused.object.id === props.highlightedId}
        />
      )}
    </svg>
  );
}
