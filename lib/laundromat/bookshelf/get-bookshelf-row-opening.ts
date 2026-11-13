import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

import type { BookshelfRow } from "./bookshelf-row";

/** Return the scene-pixel outline of `row`'s open front between the side panels at `leftX` and `rightX`, through which everything on the shelf is seen. */
export function getBookshelfRowOpening(options: {
  row: BookshelfRow;
  leftX: number;
  rightX: number;
  projection: IsoProjection;
}) {
  const { row, projection } = options;
  return [
    { x: options.leftX, z: row.floorZ },
    { x: options.rightX, z: row.floorZ },
    { x: options.rightX, z: row.ceilingZ },
    { x: options.leftX, z: row.ceilingZ },
  ].map(({ x, z }) =>
    projectIsoPoint({ point: { x, y: row.frontY, z }, projection })
  );
}
