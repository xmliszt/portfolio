import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import {
  type IsoProjection,
  projectIsoPoint,
  type ScreenPoint,
} from "@/lib/laundromat/project-iso-point";
import type { SceneDecoration } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

const ARC_STEPS = 24;
const SCALLOPS = 7;

/** Return the stand, trunk, tiers, baubles, light bulbs and star of a Christmas tree filling `object`'s box, tiers listed bottom first. */
export function getChristmasTreeShape(options: {
  object: Extract<SceneDecoration, { kind: "christmas-tree" }>;
  projection: IsoProjection;
}) {
  const { object, projection } = options;
  const { position, size } = object;
  const center = { x: position.x + size.w / 2, y: position.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) / 2;
  const standTop = position.z + size.h * (object.potted ? 0.2 : 0.07);
  const foliageBottom = position.z + size.h * (object.potted ? 0.24 : 0.14);
  const foliageTop = position.z + size.h * 0.9;
  const tierCount = object.potted ? 3 : 4;
  const foliageHeight = foliageTop - foliageBottom;
  const tierHeight = foliageHeight / (tierCount * 0.6 + 0.4);

  function project(point: { x: number; y: number; z: number }) {
    return projectIsoPoint({ point, projection });
  }
  function lerp(options: { from: ScreenPoint; to: ScreenPoint; t: number }) {
    return {
      x: options.from.x + (options.to.x - options.from.x) * options.t,
      y: options.from.y + (options.to.y - options.from.y) * options.t,
    };
  }

  const stand = getIsoCylinder({
    center,
    bottom: position.z,
    top: standTop,
    radius: radius * (object.potted ? 0.42 : 0.3),
    topRadius: radius * (object.potted ? 0.5 : 0.26),
    projection,
  });
  const trunk = getIsoCylinder({
    center,
    bottom: standTop,
    top: foliageBottom + tierHeight * 0.2,
    radius: radius * 0.09,
    projection,
  });

  const tiers = Array.from({ length: tierCount }, (_, index) => {
    const bottom = foliageBottom + index * tierHeight * 0.6;
    const ellipse = getIsoEllipse({
      center: { ...center, z: bottom },
      radius: radius * (1 - (index / tierCount) * 0.72),
      projection,
    });
    const apex = project({
      ...center,
      z: index === tierCount - 1 ? foliageTop : bottom + tierHeight,
    });
    function rim(t: number) {
      const scallop = Math.abs(Math.sin(t * SCALLOPS)) * ellipse.ry * 0.16;
      return {
        x: ellipse.cx - ellipse.rx * Math.cos(t),
        y: ellipse.cy + ellipse.ry * Math.sin(t) + scallop,
      };
    }
    const steps = Array.from(
      { length: ARC_STEPS + 1 },
      (_, step) => (step * Math.PI) / ARC_STEPS
    );
    const left = steps.filter((t) => t <= Math.PI / 2 + 1e-9).map(rim);
    const right = steps.filter((t) => t >= Math.PI / 2 - 1e-9).map(rim);
    function onSurface(at: { t: number; up: number }) {
      return lerp({ from: rim(at.t), to: apex, t: at.up });
    }
    const baubles = [0.22, 0.5, 0.8].map((t, place) => ({
      at: onSurface({ t: t * Math.PI, up: 0.12 + ((place + index) % 2) * 0.1 }),
      color: (place + index) % 3,
    }));
    const bulbs = Array.from({ length: 6 }, (_, place) =>
      onSurface({
        t: ((place + 0.5) / 6) * Math.PI,
        up: 0.32 + (place / 6) * 0.22,
      })
    );
    return {
      lit: toSvgPoints([apex, ...left]),
      shaded: toSvgPoints([apex, ...right]),
      edge: `M${[...left, ...right.slice(1)]
        .map((point) => `${point.x},${point.y}`)
        .join(" L")}`,
      baubles,
      bulbs,
    };
  });

  const top = project({ ...center, z: foliageTop });
  const starRadius = Math.min(size.w, size.h * 0.32) * projection.unit * 0.16;
  const star = toSvgPoints(
    Array.from({ length: 10 }, (_, index) => {
      const angle = -Math.PI / 2 + (index * Math.PI) / 5;
      const reach = index % 2 === 0 ? starRadius : starRadius * 0.45;
      return {
        x: top.x + Math.cos(angle) * reach,
        y: top.y - starRadius * 0.55 + Math.sin(angle) * reach,
      };
    })
  );

  return {
    stand,
    trunk,
    tiers,
    bulbs: tiers.flatMap((tier) => tier.bulbs),
    star,
    starCenter: { x: top.x, y: top.y - starRadius * 0.55 },
    starRadius,
    base: project({ ...center, z: position.z }),
    baubleRadius: radius * projection.unit * 0.13,
    bulbRadius: radius * projection.unit * 0.055,
  };
}
