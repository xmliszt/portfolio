import { Fragment } from "react";

import type {
  LaidOutObject,
  SceneLayout,
} from "@/lib/laundromat/build-scene-layout";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { PlaceholderObject } from "./placeholder-object";
import { RoomLight } from "./room-light";
import { WallClock } from "./wall-clock";
import { WindowSky } from "./window-sky";

const CLOCK_FACE_RATIO = 0.88;

type RoomDrawingProps = {
  layout: SceneLayout;
  highlightedId: string | undefined;
  focusedObjectId: string | undefined;
  dimAmount: number;
  hour: number | undefined;
  config: SceneConfig;
};

export function RoomDrawing(props: RoomDrawingProps) {
  const { layout, config, hour } = props;
  const timeOfDay =
    hour === undefined ? undefined : getTimeOfDay({ hour, config });
  const windowObject = layout.objects.find(
    ({ object }) => object.kind === "window"
  );

  function renderTimeOfDay(laidOut: LaidOutObject) {
    if (hour === undefined || timeOfDay === undefined) return null;
    const { kind, position, size } = laidOut.object;
    if (kind === "window") {
      return (
        <WindowSky
          laidOut={laidOut}
          timeOfDay={timeOfDay}
          projection={layout.projection}
          sky={config.sky}
        />
      );
    }
    if (kind === "clock") {
      return (
        <WallClock
          center={{
            x: position.x + size.w / 2,
            y: position.y + size.d,
            z: position.z + size.h / 2,
          }}
          radius={(Math.min(size.w, size.h) / 2) * CLOCK_FACE_RATIO}
          wall="back"
          hour={hour}
          projection={layout.projection}
        />
      );
    }
    return null;
  }

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
      {timeOfDay !== undefined && (
        <RoomLight
          window={windowObject}
          timeOfDay={timeOfDay}
          projection={layout.projection}
          config={config}
        />
      )}
      {layout.objects.map((laidOut) => (
        <Fragment key={laidOut.object.id}>
          <PlaceholderObject
            laidOut={laidOut}
            highlighted={laidOut.object.id === props.highlightedId}
          />
          {renderTimeOfDay(laidOut)}
        </Fragment>
      ))}
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
