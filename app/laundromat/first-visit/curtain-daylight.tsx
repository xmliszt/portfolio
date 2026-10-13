import { useId, useState } from "react";
import type { MotionValue } from "motion/react";
import { useMotionValueEvent } from "motion/react";

import {
  DAYLIGHT_PATCH_BLUR_PX,
  DaylightPatch,
} from "@/app/laundromat/daylight-patch";
import type { BedroomConfig } from "@/lib/laundromat/first-visit/bedroom-config";
import type { WindowLightSource } from "@/lib/laundromat/first-visit/get-bedroom-window-light";
import { getCurtainGap } from "@/lib/laundromat/first-visit/get-curtain-gap";
import type { getCurtainLayout } from "@/lib/laundromat/first-visit/get-curtain-layout";
import { getDaylightPatch } from "@/lib/laundromat/get-daylight-patch";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { RenderQuality } from "@/lib/laundromat/render-quality/render-quality";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import type { CurtainPose } from "./use-curtain-pose";

const PATCH_REACH = 2.3;
const THROUGH_CLOTH = 0.16;
const GAP_SOFTEN_PX = 5;
const MASK_MARGIN_PX = 24;

type CurtainDaylightProps = {
  pose: MotionValue<CurtainPose>;
  layout: ReturnType<typeof getCurtainLayout>;
  curtain: BedroomConfig["curtain"];
  projection: IsoProjection;
  source: WindowLightSource;
  scene: SceneConfig;
  tier: RenderQuality;
};

/** Draw one light `source` (the sun or the moon) on the floor through the window, full where the curtains leave the glass bare and `THROUGH_CLOTH` of it where they cover it, with the edges of the bare stretch blurred on the `"full"` tier. */
export function CurtainDaylight(props: CurtainDaylightProps) {
  const id = useId();
  const { layout, projection, source } = props;
  const [leader, setLeader] = useState(props.pose.get().rings.at(-1)!);
  useMotionValueEvent(props.pose, "change", (pose) =>
    setLeader(pose.rings.at(-1)!)
  );
  const gap = getCurtainGap({
    leader,
    layout,
    stackOutset: props.curtain.stackOutset,
  });

  function patch(options: { fromY: number; toY: number; spill?: number }) {
    const spill = options.spill ?? 0;
    return getDaylightPatch({
      wallX: layout.wallX - spill,
      fromY: options.fromY,
      toY: options.toY,
      reach: PATCH_REACH + 2 * spill,
      sun: source.sun,
    }).map((point) =>
      projectIsoPoint({ point: { ...point, z: 0 }, projection })
    );
  }

  const fullPatch = patch({
    fromY: layout.opening.near,
    toY: layout.opening.far,
  });
  const spill = (3 * DAYLIGHT_PATCH_BLUR_PX) / projection.unit;
  const clothMask = patch({
    fromY: layout.opening.near - spill,
    toY: layout.opening.far + spill,
    spill,
  });
  const xs = clothMask.map((point) => point.x);
  const ys = clothMask.map((point) => point.y);
  const gapWidthPx = (gap.far - gap.near) * projection.unit;
  const isFull = props.tier === "full";

  return (
    <g mask={`url(#${id}-gap)`}>
      <defs>
        {isFull && (
          <filter
            id={`${id}-soften`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation={GAP_SOFTEN_PX} />
          </filter>
        )}
        <mask
          id={`${id}-gap`}
          maskUnits="userSpaceOnUse"
          x={Math.min(...xs) - MASK_MARGIN_PX}
          y={Math.min(...ys) - MASK_MARGIN_PX}
          width={Math.max(...xs) - Math.min(...xs) + 2 * MASK_MARGIN_PX}
          height={Math.max(...ys) - Math.min(...ys) + 2 * MASK_MARGIN_PX}
        >
          <polygon
            fill="white"
            opacity={THROUGH_CLOTH}
            points={toSvgPoints(clothMask)}
          />
          {gap.uncovered > 0 && (
            <polygon
              fill="white"
              opacity={Math.min(1, gapWidthPx / (2 * GAP_SOFTEN_PX))}
              filter={isFull ? `url(#${id}-soften)` : undefined}
              points={toSvgPoints(
                patch({ fromY: gap.near, toY: gap.far, spill })
              )}
            />
          )}
        </mask>
      </defs>
      <DaylightPatch
        points={fullPatch}
        color={source.color}
        opacity={source.strength * props.scene.light.daylightPatchStrength}
        glideMs={props.scene.sky.timeJumpGlideMs}
      />
    </g>
  );
}
