import type {
  IsoProjection,
  ScreenPoint,
} from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

const FAR_RISE = 0.7;

function curveThrough(options: {
  from: ScreenPoint;
  through: ScreenPoint;
  to: ScreenPoint;
}) {
  const { from, through, to } = options;
  const control = {
    x: 2 * through.x - (from.x + to.x) / 2,
    y: 2 * through.y - (from.y + to.y) / 2,
  };
  return `Q ${control.x} ${control.y} ${to.x} ${to.y}`;
}

/** Return SVG paths for a puffy pillow in the box at `position` and `size`: its `top`, the `front` (+y) and `side` (+x) lenses below the seam, the visible `seam`, and `topZ`, the height its top is lit at, with the corners pinched to half height and the seam bulging out by `puff`. */
export function getPillowShape(options: {
  position: IsoPoint;
  size: IsoSize;
  puff: number;
  projection: IsoProjection;
}) {
  const { x, y, z } = options.position;
  const { w, d, h } = options.size;
  const { puff } = options;
  const seamZ = z + h / 2;
  const farZ = z + h * FAR_RISE;
  function at(point: IsoPoint) {
    return projectIsoPoint({ point, projection: options.projection });
  }
  const backLeft = at({ x, y, z: seamZ });
  const backRight = at({ x: x + w, y, z: seamZ });
  const frontRight = at({ x: x + w, y: y + d, z: seamZ });
  const frontLeft = at({ x, y: y + d, z: seamZ });
  const frontSeam = curveThrough({
    from: frontLeft,
    through: at({ x: x + w / 2, y: y + d + puff, z: seamZ }),
    to: frontRight,
  });
  const sideSeam = curveThrough({
    from: backRight,
    through: at({ x: x + w + puff, y: y + d / 2, z: seamZ }),
    to: frontRight,
  });
  const move = (point: ScreenPoint) => `M ${point.x} ${point.y}`;
  const top = [
    move(frontLeft),
    curveThrough({
      from: frontLeft,
      through: at({ x: x - puff / 2, y: y + d / 2, z: farZ }),
      to: backLeft,
    }),
    curveThrough({
      from: backLeft,
      through: at({ x: x + w / 2, y: y - puff / 2, z: farZ }),
      to: backRight,
    }),
    sideSeam,
    curveThrough({
      from: frontRight,
      through: at({ x: x + w / 2, y: y + d + puff, z: seamZ }),
      to: frontLeft,
    }),
    "Z",
  ].join(" ");
  const front = [
    move(frontLeft),
    frontSeam,
    curveThrough({
      from: frontRight,
      through: at({ x: x + w / 2, y: y + d, z }),
      to: frontLeft,
    }),
    "Z",
  ].join(" ");
  const side = [
    move(backRight),
    sideSeam,
    curveThrough({
      from: frontRight,
      through: at({ x: x + w, y: y + d / 2, z }),
      to: backRight,
    }),
    "Z",
  ].join(" ");
  const seam = [move(frontLeft), frontSeam, move(backRight), sideSeam].join(
    " "
  );
  return { top, front, side, seam, topZ: farZ };
}
