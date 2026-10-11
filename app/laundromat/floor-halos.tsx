import { useId } from "react";

import type { SceneLayout } from "@/lib/laundromat/build-scene-layout";
import { getFloorHalo } from "@/lib/laundromat/get-floor-halo";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const BLUR_PER_UNIT = 0.2;
const DROP_PER_UNIT = 0.08;

type FloorHalosProps = {
  layout: SceneLayout;
};

/** Draw a soft shadow on the floor under every object that stands on it. */
export function FloorHalos(props: FloorHalosProps) {
  const id = useId();
  const { projection } = props.layout;
  const halos = props.layout.objects.flatMap(({ object }) => {
    const halo = getFloorHalo({ object, projection });
    return halo === undefined ? [] : [{ id: object.id, halo }];
  });
  return (
    <g
      className="pointer-events-none fill-[var(--lm-halo)] stroke-none"
      filter={`url(#${id}-blur)`}
      opacity={0.45}
      transform={`translate(0 ${DROP_PER_UNIT * projection.unit})`}
    >
      <defs>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={BLUR_PER_UNIT * projection.unit} />
        </filter>
      </defs>
      {halos.map(({ id: objectId, halo }) => {
        switch (halo.kind) {
          case "polygon":
            return <polygon key={objectId} points={toSvgPoints(halo.points)} />;
          case "ellipse":
            return (
              <ellipse
                key={objectId}
                cx={halo.cx}
                cy={halo.cy}
                rx={halo.rx}
                ry={halo.ry}
              />
            );
          default: {
            const unhandled: never = halo;
            return unhandled;
          }
        }
      })}
    </g>
  );
}
