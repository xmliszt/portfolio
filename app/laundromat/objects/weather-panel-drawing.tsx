import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { getWeatherPanelFace } from "@/lib/laundromat/weather/get-weather-panel-face";
import type { WeatherReading } from "@/lib/laundromat/weather/weather-reading";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";
import { WeatherPanelFace } from "./weather-panel-face";

type WeatherPanelDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  weather: WeatherReading | undefined;
  details: SceneConfig["details"]["weatherPanel"];
};

export function WeatherPanelDrawing(props: WeatherPanelDrawingProps) {
  const { quality } = useRenderQuality();
  const { projection } = props;
  const { position, size } = props.laidOut.object;
  const { transform, rects } = getWeatherPanelFace({
    position,
    size,
    projection,
  });
  const seamZ = position.z + rects.chin.height / projection.unit;
  const edge = getFacePlane({
    plane: "front",
    origin: { x: position.x, y: position.y + size.d, z: seamZ },
    projection,
  });

  return (
    <g data-weather-panel strokeLinejoin="round" strokeLinecap="round">
      <g className={partStroke(props.highlighted)} strokeWidth={1}>
        <IsoBox position={position} size={size} projection={projection} />
      </g>
      <line
        transform={edge.transform}
        x1={0}
        y1={0}
        x2={size.w * projection.unit}
        y2={0}
        className="stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      <g transform={transform}>
        <WeatherPanelFace
          rects={rects}
          weather={props.weather}
          animated={quality !== "lite"}
          glyphMotionSeconds={props.details.glyphMotionSeconds}
        />
      </g>
    </g>
  );
}
