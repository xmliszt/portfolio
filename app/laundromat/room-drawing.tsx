import type { SceneLayout } from "@/lib/laundromat/build-scene-layout";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { SceneKeyframes } from "./objects/scene-keyframes";
import { SceneObjectDrawing } from "./objects/scene-object-drawing";
import type { SceneViews } from "./objects/scene-views";
import type { LampSwitch } from "./sound/use-scene-sounds";
import { RoomLampGlow } from "./room-lamp-glow";
import { RoomLight } from "./room-light";

type RoomDrawingProps = {
  layout: SceneLayout;
  highlightedId: string | undefined;
  focusedObjectId: string | undefined;
  hiddenObjectId: string | undefined;
  dimAmount: number;
  views: SceneViews;
  hour: number | undefined;
  lampSwitch: LampSwitch | undefined;
  config: SceneConfig;
};

export function RoomDrawing(props: RoomDrawingProps) {
  const { layout, config, hour } = props;
  const timeOfDay =
    hour === undefined ? undefined : getTimeOfDay({ hour, config });
  const windowObject = layout.objects.find(
    ({ object }) => object.kind === "window"
  );

  const objectProps = {
    projection: layout.projection,
    highlightedId: props.highlightedId,
    views: props.views,
    hour,
    timeOfDay,
    config,
  };
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
      data-lm-lamp-switch={props.lampSwitch}
    >
      <SceneKeyframes plant={config.details.plant} />
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
      {layout.objects
        .filter(({ object }) => object.id !== props.hiddenObjectId)
        .map((laidOut) => (
          <SceneObjectDrawing
            key={laidOut.object.id}
            laidOut={laidOut}
            {...objectProps}
          />
        ))}
      {timeOfDay !== undefined && (
        <RoomLampGlow
          timeOfDay={timeOfDay}
          projection={layout.projection}
          size={layout.size}
          config={config}
        />
      )}
      <rect
        width={layout.size.width}
        height={layout.size.height}
        className="fill-[var(--lm-bg)] transition-opacity duration-500"
        opacity={focused === undefined ? 0 : props.dimAmount}
      />
      {focused !== undefined && focused.object.id !== props.hiddenObjectId && (
        <SceneObjectDrawing laidOut={focused} {...objectProps} />
      )}
    </svg>
  );
}
