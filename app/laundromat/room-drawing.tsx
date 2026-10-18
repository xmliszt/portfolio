import { Fragment } from "react";

import type {
  LaidOutObject,
  SceneLayout,
} from "@/lib/laundromat/build-scene-layout";
import { getDaylitTokenStyle } from "@/lib/laundromat/get-daylit-token-style";
import { getTimeOfDay } from "@/lib/laundromat/get-time-of-day";
import { getWindowLights } from "@/lib/laundromat/get-window-lights";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { getWindowWeather } from "@/lib/laundromat/weather/get-window-weather";

import { SceneKeyframes } from "./objects/scene-keyframes";
import { SceneObjectDrawing } from "./objects/scene-object-drawing";
import type { SceneViews } from "./objects/scene-views";
import type { LampSwitch } from "./sound/use-scene-sounds";
import { RoomDarknessVeil } from "./room-darkness-veil";
import { RoomDaylightFill } from "./room-daylight-fill";
import { RoomLampGlow } from "./room-lamp-glow";
import { RoomLight } from "./room-light";
import { WindowFaceLight } from "./window-face-light";

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
  const windowLights =
    timeOfDay === undefined || windowObject === undefined
      ? []
      : getWindowLights({
          window: windowObject.object,
          timeOfDay,
          config,
        }).map((light) => ({
          ...light,
          opacity:
            light.opacity *
            getWindowWeather(props.views.weather?.condition).sunlight,
        }));
  const visibleObjects = layout.objects.filter(
    ({ object }) => object.id !== props.hiddenObjectId
  );

  const objectProps = {
    projection: layout.projection,
    highlightedId: props.highlightedId,
    views: props.views,
    hour,
    timeOfDay,
    config,
  };
  function renderFaceLight(laidOut: LaidOutObject) {
    return windowLights.map((windowLight) => (
      <WindowFaceLight
        key={windowLight.key}
        laidOut={laidOut}
        light={windowLight}
        projection={layout.projection}
        glideMs={config.sky.timeJumpGlideMs}
      />
    ));
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
      data-instant-camera-subject="laundromat"
      data-lm-lamp-switch={props.lampSwitch}
      data-lm-daylit
      style={getDaylitTokenStyle({ config, hour })}
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
          windowLights={windowLights}
          objects={visibleObjects}
          timeOfDay={timeOfDay}
          projection={layout.projection}
          config={config}
        />
      )}
      {visibleObjects.map((laidOut) => (
        <Fragment key={laidOut.object.id}>
          <SceneObjectDrawing laidOut={laidOut} {...objectProps} />
          {renderFaceLight(laidOut)}
        </Fragment>
      ))}
      {timeOfDay !== undefined && windowObject !== undefined && (
        <RoomDaylightFill
          window={windowObject}
          timeOfDay={timeOfDay}
          projection={layout.projection}
          size={layout.size}
          config={config}
        />
      )}
      {timeOfDay !== undefined && (
        <RoomLampGlow
          timeOfDay={timeOfDay}
          projection={layout.projection}
          size={layout.size}
          config={config}
        />
      )}
      {timeOfDay !== undefined && (
        <RoomDarknessVeil
          timeOfDay={timeOfDay}
          projection={layout.projection}
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
        <>
          <SceneObjectDrawing laidOut={focused} {...objectProps} />
          {renderFaceLight(focused)}
        </>
      )}
    </svg>
  );
}
