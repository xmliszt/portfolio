import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";

import { CylinderSides } from "./cylinder-sides";
import { partStroke } from "./part-stroke";
import { SteamWisps } from "./steam-wisps";

type MugDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  full: boolean;
  steaming: boolean;
  details: SceneConfig["details"]["coffee"];
};

export function MugDrawing(props: MugDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) * 0.38;
  const mug = getIsoCylinder({
    center,
    bottom: p.z,
    top: p.z + size.h,
    radius,
    projection,
  });
  const inner = getIsoEllipse({
    center: { ...center, z: p.z + size.h },
    radius: radius * 0.82,
    projection,
  });
  const coffee = getIsoEllipse({
    center: { ...center, z: p.z + size.h - 0.03 },
    radius: radius * 0.76,
    projection,
  });
  const handle = {
    x: mug.top.cx + mug.top.rx,
    top: mug.top.cy + (mug.base.cy - mug.top.cy) * 0.22,
    bottom: mug.top.cy + (mug.base.cy - mug.top.cy) * 0.72,
  };
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      <path
        d={`M ${handle.x - 0.5} ${handle.top} C ${handle.x + 6} ${handle.top - 1} ${handle.x + 6} ${handle.bottom + 1} ${handle.x - 0.5} ${handle.bottom}`}
        className="fill-none"
        strokeWidth={2.5}
      />
      <path
        d={`M ${handle.x - 0.5} ${handle.top} C ${handle.x + 6} ${handle.top - 1} ${handle.x + 6} ${handle.bottom + 1} ${handle.x - 0.5} ${handle.bottom}`}
        className="fill-none stroke-[var(--lm-face)]"
        strokeWidth={1}
      />
      <CylinderSides body={mug.body} facets={mug.facets} />
      <ellipse {...mug.top} className="fill-[var(--lm-face-top)]" />
      <ellipse
        {...inner}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      {props.full && (
        <ellipse {...coffee} className="fill-[var(--lm-detail)] stroke-none" />
      )}
      {props.full && props.steaming && (
        <SteamWisps
          x={mug.top.cx}
          y={mug.top.cy - 1}
          height={12}
          opacity={props.details.steamOpacity}
          riseSeconds={props.details.steamRiseSeconds}
        />
      )}
    </g>
  );
}
