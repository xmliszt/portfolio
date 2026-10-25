import {
  type IsoProjection,
  projectIsoPoint,
  type ScreenPoint,
} from "@/lib/laundromat/project-iso-point";
import type { SceneDecoration } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

export function getPumpkinShape(options: {
  object: Extract<SceneDecoration, { kind: "pumpkin" }>;
  projection: IsoProjection;
}) {
  const { position, size } = options.object;
  function surface(coordinates: { longitude: number; latitude: number }) {
    const { longitude, latitude } = coordinates;
    const radius =
      Math.sin(latitude) * (0.94 + 0.06 * Math.cos(longitude * 10));
    return {
      x: position.x + size.w * (0.5 + 0.5 * radius * Math.cos(longitude)),
      y: position.y + size.d * (0.5 + 0.5 * radius * Math.sin(longitude)),
      z: position.z + size.h * 0.44 * (1 + Math.cos(latitude)),
    };
  }
  function project(point: Parameters<typeof projectIsoPoint>[0]["point"]) {
    return projectIsoPoint({ point, projection: options.projection });
  }
  const facets = Array.from({ length: 40 * 16 }, (_, index) => {
    const longitude = ((index % 40) * Math.PI) / 20;
    const latitude = (Math.floor(index / 40) * Math.PI) / 16;
    const middle = surface({
      longitude: longitude + Math.PI / 40,
      latitude: latitude + Math.PI / 32,
    });
    const normal = {
      x: Math.sin(latitude + Math.PI / 32) * Math.cos(longitude + Math.PI / 40),
      y: Math.sin(latitude + Math.PI / 32) * Math.sin(longitude + Math.PI / 40),
      z: Math.cos(latitude + Math.PI / 32),
    };
    const light = normal.y * 0.5 + normal.z * 0.6 - normal.x * 0.2;
    return {
      points: toSvgPoints(
        [
          surface({ longitude, latitude }),
          surface({ longitude: longitude + Math.PI / 20, latitude }),
          surface({
            longitude: longitude + Math.PI / 20,
            latitude: latitude + Math.PI / 16,
          }),
          surface({ longitude, latitude: latitude + Math.PI / 16 }),
        ].map(project)
      ),
      depth: middle.x + middle.y + middle.z,
      visible: normal.x + normal.y + normal.z > -0.15,
      shade: light > 0.5 ? 0 : light > 0.1 ? 1 : light > -0.3 ? 2 : 3,
    };
  })
    .filter((facet) => facet.visible)
    .toSorted((a, b) => a.depth - b.depth);
  function facePoint(point: ScreenPoint) {
    return project(
      surface({
        longitude:
          Math.PI / 4 +
          (options.object.facingDeg * Math.PI) / 180 -
          point.x * 0.8,
        latitude: Math.PI * (0.49 + point.y * 0.2),
      })
    );
  }
  function cutout(points: ScreenPoint[]) {
    return toSvgPoints(
      points.flatMap((point, index) => {
        const next = points.at((index + 1) % points.length) ?? point;
        return Array.from({ length: 5 }, (_, step) =>
          facePoint({
            x: point.x + ((next.x - point.x) * step) / 5,
            y: point.y + ((next.y - point.y) * step) / 5,
          })
        );
      })
    );
  }
  const eyes = [-1, 1].map((side) =>
    cutout([
      { x: side * 0.72, y: -0.22 },
      { x: side * 0.21, y: -0.13 },
      { x: side * 0.4, y: -0.59 },
    ])
  );
  const nose = cutout([
    { x: 0, y: -0.13 },
    { x: -0.12, y: 0.12 },
    { x: 0.12, y: 0.12 },
  ]);
  const mouth = cutout([
    { x: -0.76, y: 0.18 },
    { x: -0.48, y: 0.31 },
    { x: -0.33, y: 0.33 },
    { x: -0.33, y: 0.48 },
    { x: -0.17, y: 0.5 },
    { x: -0.17, y: 0.36 },
    { x: 0.48, y: 0.31 },
    { x: 0.76, y: 0.18 },
    { x: 0.51, y: 0.68 },
    { x: 0.23, y: 0.79 },
    { x: 0.23, y: 0.62 },
    { x: 0.06, y: 0.64 },
    { x: 0.06, y: 0.81 },
    { x: -0.35, y: 0.75 },
    { x: -0.58, y: 0.56 },
  ]);
  const ribs = Array.from({ length: 10 }, (_, index) => {
    const longitude = ((index + 0.5) * Math.PI) / 5;
    return Array.from({ length: 22 }, (_, step) => {
      const latitude = 0.3 + (step * 2.55) / 21;
      const visible =
        Math.sin(latitude) * (Math.cos(longitude) + Math.sin(longitude)) +
          Math.cos(latitude) >
        0.08;
      const point = project(surface({ longitude, latitude }));
      return `${step === 0 || !visible ? "M" : "L"}${point.x},${point.y}`;
    }).join(" ");
  });
  const stem = [
    { x: 0.44, y: 0.47, z: 0.84 },
    { x: 0.44, y: 0.47, z: 0.96 },
    { x: 0.51, y: 0.43, z: 1 },
    { x: 0.57, y: 0.46, z: 0.97 },
    { x: 0.53, y: 0.51, z: 0.93 },
    { x: 0.55, y: 0.55, z: 0.84 },
  ].map((point) =>
    project({
      x: position.x + point.x * size.w,
      y: position.y + point.y * size.d,
      z: position.z + point.z * size.h,
    })
  );
  return {
    facets,
    ribs,
    cutouts: [...eyes, nose, mouth],
    stem: toSvgPoints(stem),
    center: facePoint({ x: 0, y: 0.2 }),
  };
}
