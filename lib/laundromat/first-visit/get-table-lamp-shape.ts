import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type {
  IsoProjection,
  ScreenPoint,
} from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";

const DOME_RADIUS_MM = 80;
const FOOT = { radiusMm: 40, heightMm: 17 };
const PLATE = { radiusMm: 53, heightMm: 4 };
const STEM_MM = [
  { z: 21, r: 36 },
  { z: 26, r: 26 },
  { z: 32, r: 18 },
  { z: 40, r: 13 },
  { z: 50, r: 10 },
  { z: 62, r: 8 },
  { z: 80, r: 6.2 },
  { z: 100, r: 5 },
  { z: 120, r: 4.6 },
  { z: 140, r: 5.2 },
  { z: 152, r: 6 },
];
const SEAM = { zMm: 110, rMm: 4.8 };
const RIM_MM = 150;
const DOME_HEIGHT_MM = 77;
const DOME_RINGS = 12;
const FINIAL = { radiusMm: 4.5, neckMm: 5 };
const HULL_STEPS = 48;

function cross(o: ScreenPoint, a: ScreenPoint, b: ScreenPoint) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function convexHull(points: ScreenPoint[]) {
  const sorted = points.toSorted((a, b) => a.x - b.x || a.y - b.y);
  function chain(list: ScreenPoint[]) {
    return list.reduce<ScreenPoint[]>((hull, point) => {
      const kept = [...hull];
      while (
        kept.length >= 2 &&
        cross(kept.at(-2)!, kept.at(-1)!, point) <= 0
      ) {
        kept.pop();
      }
      return [...kept, point];
    }, []);
  }
  const lower = chain(sorted);
  const upper = chain(sorted.toReversed());
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/** Return the screen geometry of a mushroom table lamp standing on `tableTop` at `center`, sized so its dome's radius is `domeRadius`: the `foot` and `plate` cylinders, the trumpet `stem` outline with its `stemLeft` and `stemRight` silhouettes and a front `seam` arc, the dome's outline `dome`, the `finial` ball, the dome `rimZ` and its full `height`. */
export function getTableLampShape(options: {
  center: { x: number; y: number };
  tableTop: number;
  domeRadius: number;
  projection: IsoProjection;
}) {
  const { center, tableTop, projection } = options;
  const unitsPerMm = options.domeRadius / DOME_RADIUS_MM;
  function z(mm: number) {
    return tableTop + mm * unitsPerMm;
  }
  function ring(options: { zMm: number; rMm: number }) {
    return getIsoEllipse({
      center: { ...center, z: z(options.zMm) },
      radius: options.rMm * unitsPerMm,
      projection,
    });
  }
  function frontArc(ellipse: ReturnType<typeof getIsoEllipse>) {
    return `M ${ellipse.cx - ellipse.rx} ${ellipse.cy} A ${ellipse.rx} ${ellipse.ry} 0 0 0 ${ellipse.cx + ellipse.rx} ${ellipse.cy}`;
  }

  const foot = getIsoCylinder({
    center,
    bottom: z(0),
    top: z(FOOT.heightMm),
    radius: FOOT.radiusMm * unitsPerMm,
    projection,
  });
  const plate = getIsoCylinder({
    center,
    bottom: z(FOOT.heightMm),
    top: z(FOOT.heightMm + PLATE.heightMm),
    radius: PLATE.radiusMm * unitsPerMm,
    projection,
  });
  const stemRings = STEM_MM.map((point) =>
    ring({ zMm: point.z, rMm: point.r })
  );
  const stemLeft = stemRings.map((ellipse) => ({
    x: ellipse.cx - ellipse.rx,
    y: ellipse.cy,
  }));
  const stemRight = stemRings.map((ellipse) => ({
    x: ellipse.cx + ellipse.rx,
    y: ellipse.cy,
  }));
  const stemBase = stemRings[0]!;
  const stem = [
    `M ${stemLeft.map((point) => `${point.x} ${point.y}`).join(" L ")}`,
    `L ${stemRight
      .toReversed()
      .map((point) => `${point.x} ${point.y}`)
      .join(" L ")}`,
    `A ${stemBase.rx} ${stemBase.ry} 0 0 1 ${stemLeft[0]!.x} ${stemLeft[0]!.y}`,
    "Z",
  ].join(" ");

  const domeRings = Array.from({ length: DOME_RINGS + 1 }, (_, index) => {
    const angle = (index / DOME_RINGS) * (Math.PI / 2);
    return ring({
      zMm: RIM_MM + DOME_HEIGHT_MM * Math.sin(angle),
      rMm: Math.max(DOME_RADIUS_MM * Math.cos(angle), 0.01),
    });
  });
  const dome = convexHull(
    domeRings.flatMap((ellipse) =>
      Array.from({ length: HULL_STEPS }, (_, step) => {
        const angle = (step / HULL_STEPS) * Math.PI * 2;
        return {
          x: ellipse.cx + ellipse.rx * Math.cos(angle),
          y: ellipse.cy + ellipse.ry * Math.sin(angle),
        };
      })
    )
  );
  const domeTopMm = RIM_MM + DOME_HEIGHT_MM;
  const finial = projectIsoPoint({
    point: {
      ...center,
      z: z(domeTopMm + FINIAL.neckMm + FINIAL.radiusMm),
    },
    projection,
  });

  return {
    foot,
    plate,
    stem,
    stemLeft,
    stemRight,
    seam: frontArc(ring(SEAM)),
    dome,
    finial: {
      cx: finial.x,
      cy: finial.y,
      r: FINIAL.radiusMm * unitsPerMm * projection.unit,
    },
    rimZ: z(RIM_MM),
    height: (domeTopMm + FINIAL.neckMm + 2 * FINIAL.radiusMm) * unitsPerMm,
  };
}
