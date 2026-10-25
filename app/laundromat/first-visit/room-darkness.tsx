import { useState } from "react";
import type { MotionValue } from "motion/react";
import { useMotionValueEvent } from "motion/react";

import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { BedroomWindowLight } from "@/lib/laundromat/first-visit/get-bedroom-window-light";
import { getCurtainGap } from "@/lib/laundromat/first-visit/get-curtain-gap";
import type { getCurtainLayout } from "@/lib/laundromat/first-visit/get-curtain-layout";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import type { CurtainPose } from "./use-curtain-pose";

const DARKNESS = { peak: 0.38, throughCloth: 0.2, lampMs: 220 };

type RoomDarknessProps = {
  pose: MotionValue<CurtainPose>;
  layout: ReturnType<typeof getCurtainLayout>;
  curtain: BedroomConfig["curtain"];
  room: BedroomConfig["room"];
  projection: IsoProjection;
  light: BedroomWindowLight | undefined;
  lampOn: boolean;
  darknessScale: number;
};

export function RoomDarkness(props: RoomDarknessProps) {
  const { layout, projection, room } = props;
  const [leader, setLeader] = useState(props.pose.get().rings.at(-1)!);
  useMotionValueEvent(props.pose, "change", (pose) =>
    setLeader(pose.rings.at(-1)!)
  );
  const { stackOutset } = props.curtain;
  const openUncovered = getCurtainGap({
    leader: layout.openLeader,
    layout,
    stackOutset,
  }).uncovered;
  const { uncovered } = getCurtainGap({ leader, layout, stackOutset });
  const bareShare = Math.min(uncovered / openUncovered, 1);
  const windowLight =
    (props.light?.strength ?? 0) *
    (DARKNESS.throughCloth + (1 - DARKNESS.throughCloth) * bareShare);

  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const room3d = [
    at(0, room.depth, 0),
    at(0, room.depth, room.wallHeight),
    at(0, 0, room.wallHeight),
    at(room.width, 0, room.wallHeight),
    at(room.width, 0, 0),
    at(room.width, room.depth, 0),
  ];

  return (
    <g
      className="pointer-events-none"
      style={{
        opacity: props.lampOn ? 0 : 1,
        transition: `opacity ${DARKNESS.lampMs}ms`,
      }}
    >
      <polygon
        fill="black"
        stroke="black"
        strokeWidth={2}
        strokeLinejoin="round"
        opacity={DARKNESS.peak * props.darknessScale * (1 - windowLight)}
        points={toSvgPoints(room3d)}
      />
    </g>
  );
}
