import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import type { BedroomConfig } from "./bedroom-config";

const DROP_MARGIN = { side: 30, above: 40, below: 20 };

/** Return the projected body, inner rim and mouth of the bedroom basket, and `dropZone`, the screen box a held garment drops into. */
export function getHamperBasket(options: {
  basket: BedroomConfig["basket"];
  projection: IsoProjection;
}) {
  const { basket, projection } = options;
  const cylinder = getIsoCylinder({
    center: basket.center,
    bottom: 0,
    top: basket.height,
    radius: basket.baseRadius,
    topRadius: basket.radius,
    projection,
  });
  const mouth = { x: cylinder.top.cx, y: cylinder.top.cy };
  const inner = getIsoEllipse({
    center: { ...basket.center, z: basket.height - 0.13 },
    radius: basket.radius - 0.05,
    projection,
  });
  const left = mouth.x - cylinder.top.rx;
  const top = mouth.y - cylinder.top.ry;
  const bottom = cylinder.base.cy + cylinder.base.ry;
  return {
    ...cylinder,
    inner,
    mouth,
    bounds: {
      x: left,
      y: top,
      width: cylinder.top.rx * 2,
      height: bottom - top,
    },
    dropZone: {
      x: left - DROP_MARGIN.side,
      y: top - DROP_MARGIN.above,
      width: cylinder.top.rx * 2 + DROP_MARGIN.side * 2,
      height: bottom - top + DROP_MARGIN.above + DROP_MARGIN.below,
    },
  };
}
