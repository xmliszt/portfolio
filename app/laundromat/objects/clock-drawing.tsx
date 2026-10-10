import { WallClock } from "@/app/laundromat/wall-clock";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

const FACE_RATIO = 0.88;

type ClockDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  hour: number;
  details: SceneConfig["details"]["clock"];
};

export function ClockDrawing(props: ClockDrawingProps) {
  const { position, size } = props.laidOut.object;
  return (
    <WallClock
      center={{
        x: position.x + size.w / 2,
        y: position.y + size.d,
        z: position.z + size.h / 2,
      }}
      depth={size.d}
      radius={(Math.min(size.w, size.h) / 2) * FACE_RATIO}
      wall="back"
      hour={props.hour}
      projection={props.projection}
      details={props.details}
    />
  );
}
