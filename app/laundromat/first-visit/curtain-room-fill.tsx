import { useId, useState } from "react";
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

const FILL = { peak: 0.22, throughCloth: 0.2 };
const REACH_RATIO = 0.8;

type CurtainRoomFillProps = {
  pose: MotionValue<CurtainPose>;
  layout: ReturnType<typeof getCurtainLayout>;
  curtain: BedroomConfig["curtain"];
  room: BedroomConfig["room"];
  stage: BedroomConfig["stage"];
  projection: IsoProjection;
  light: BedroomWindowLight;
};

/** Draw the light the window spreads over the walls and floor as a glow centred on the glass, as strong as the share of glass the curtains leave bare, with `FILL.throughCloth` of it passing through the cloth. */
export function CurtainRoomFill(props: CurtainRoomFillProps) {
  const id = useId();
  const { layout, projection, light, room } = props;
  const [leader, setLeader] = useState(props.pose.get().rings.at(-1)!);
  useMotionValueEvent(props.pose, "change", (pose) =>
    setLeader(pose.rings.at(-1)!)
  );
  const { uncovered } = getCurtainGap({
    leader,
    layout,
    stackOutset: props.curtain.stackOutset,
  });
  const strength =
    FILL.peak *
    light.strength *
    (FILL.throughCloth + (1 - FILL.throughCloth) * uncovered);

  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const center = at(
    layout.wallX,
    (layout.opening.near + layout.opening.far) / 2,
    (layout.opening.bottom + layout.opening.top) / 2
  );
  const shell = [
    at(0, room.depth, 0),
    at(0, room.depth, room.wallHeight),
    at(0, 0, room.wallHeight),
    at(room.width, 0, room.wallHeight),
    at(room.width, 0, 0),
    at(room.width, room.depth, 0),
  ];
  const { color } = light;

  return (
    <g className="pointer-events-none" opacity={strength}>
      <defs>
        <radialGradient
          id={`${id}-fill`}
          gradientUnits="userSpaceOnUse"
          cx={center.x}
          cy={center.y}
          r={Math.max(props.stage.width, props.stage.height) * REACH_RATIO}
        >
          <stop offset={0} stopColor={color} />
          <stop offset={0.35} stopColor={color} stopOpacity={0.4} />
          <stop offset={1} stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <polygon fill={`url(#${id}-fill)`} points={toSvgPoints(shell)} />
    </g>
  );
}
