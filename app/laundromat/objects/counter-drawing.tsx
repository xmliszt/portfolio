import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";

const TOE_KICK = { height: 0.22, inset: 0.16 };
const SLAB = { thickness: 0.14, overhang: 0.08 };
const DRAWER_HEIGHT = 0.5;
const GAP = 3;
const END_PANEL_INSET = 6;

type CounterDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
};

export function CounterDrawing(props: CounterDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const { unit } = projection;
  const bodyDepth = size.d - SLAB.overhang;
  const bodyHeight = size.h - TOE_KICK.height - SLAB.thickness;
  const front = getFacePlane({
    plane: "front",
    origin: { x: p.x, y: p.y + bodyDepth, z: p.z + size.h - SLAB.thickness },
    projection,
  });
  const side = getFacePlane({
    plane: "side",
    origin: {
      x: p.x + size.w,
      y: p.y + bodyDepth,
      z: p.z + size.h - SLAB.thickness,
    },
    projection,
  });
  const width = size.w * unit;
  const height = bodyHeight * unit;
  const drawer = {
    x: GAP,
    y: GAP,
    width: width - 2 * GAP,
    height: DRAWER_HEIGHT * unit - GAP,
  };
  const doorTop = drawer.y + drawer.height + GAP;
  const doors = [0, 1].map((index) => ({
    x: GAP + index * (width / 2),
    y: doorTop,
    width: width / 2 - 1.5 * GAP,
    height: height - doorTop - GAP,
  }));
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      <IsoBox
        position={{ x: p.x + 0.05, y: p.y, z: p.z }}
        size={{
          w: size.w - 0.1,
          d: bodyDepth - TOE_KICK.inset,
          h: TOE_KICK.height,
        }}
        projection={projection}
      />
      <IsoBox
        position={{ x: p.x, y: p.y, z: p.z + TOE_KICK.height }}
        size={{ w: size.w, d: bodyDepth, h: bodyHeight }}
        projection={projection}
      />
      <g transform={front.transform} strokeWidth={0.75}>
        <rect
          {...drawer}
          rx={1}
          className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
        />
        <line
          x1={width / 2 - 8}
          y1={drawer.y + drawer.height / 2}
          x2={width / 2 + 8}
          y2={drawer.y + drawer.height / 2}
          strokeWidth={1.5}
        />
        {doors.map((door, index) => {
          const pullX = index === 0 ? door.x + door.width - 4 : door.x + 4;
          return (
            <g key={door.x}>
              <rect
                {...door}
                rx={1}
                className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
              />
              <rect
                x={door.x + 4}
                y={door.y + 4}
                width={door.width - 8}
                height={door.height - 8}
                rx={1}
                className="fill-none stroke-[var(--lm-detail)]"
              />
              <line
                x1={pullX}
                y1={door.y + 6}
                x2={pullX}
                y2={door.y + 18}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </g>
      <g transform={side.transform} strokeWidth={0.75}>
        <rect
          x={END_PANEL_INSET}
          y={END_PANEL_INSET}
          width={bodyDepth * unit - 2 * END_PANEL_INSET}
          height={height - 2 * END_PANEL_INSET}
          rx={1}
          className="fill-none stroke-[var(--lm-detail)]"
        />
      </g>
      <IsoBox
        position={{
          x: p.x - SLAB.overhang,
          y: p.y,
          z: p.z + size.h - SLAB.thickness,
        }}
        size={{ w: size.w + 2 * SLAB.overhang, d: size.d, h: SLAB.thickness }}
        projection={projection}
      />
    </g>
  );
}
