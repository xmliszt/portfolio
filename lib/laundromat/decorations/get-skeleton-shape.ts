import {
  type IsoProjection,
  projectIsoPoint,
} from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, SceneDecoration } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

type Material = "bone" | "joint" | "recess";
type Face = {
  points: string;
  shade: number;
  material: Material;
  depth: number;
};

export function getSkeletonShape(options: {
  object: Extract<SceneDecoration, { kind: "skeleton" }>;
  projection: IsoProjection;
  shy?: number;
}) {
  const { position, size } = options.object;
  const projection = options.projection;
  const faces: Face[] = [];
  const yaw = -Math.PI / 9;
  const shy = Math.max(0, Math.min(1, options.shy ?? 0));
  function blend(options: { resting: number; shy: number }) {
    return options.resting + (options.shy - options.resting) * shy;
  }
  function world(point: IsoPoint) {
    const tilt = Math.max(0, point.z - 0.78) * shy;
    const x = point.x + tilt * 0.75;
    return {
      x:
        position.x +
        size.w * (0.5 + x * Math.cos(yaw) - point.y * Math.sin(yaw)),
      y:
        position.y +
        size.d * (0.5 + x * Math.sin(yaw) + point.y * Math.cos(yaw)),
      z: position.z + size.h * (point.z - tilt * 0.1),
    };
  }
  function face(options: {
    points: [IsoPoint, IsoPoint, IsoPoint, ...IsoPoint[]];
    material: Material;
  }) {
    const { points, material } = options;
    const [a, b, c] = points;
    const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
    const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z };
    const normal = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x,
    };
    const length = Math.hypot(normal.x, normal.y, normal.z);
    if (length === 0 || normal.x + normal.y + normal.z <= 0) return;
    const light = (-normal.x * 0.25 + normal.y * 0.5 + normal.z * 0.7) / length;
    faces.push({
      points: toSvgPoints(
        points.map((point) => projectIsoPoint({ point, projection }))
      ),
      shade: light > 0.5 ? 0 : light > 0.1 ? 1 : light > -0.3 ? 2 : 3,
      material,
      depth:
        points.reduce((sum, point) => sum + point.x + point.y + point.z, 0) /
        points.length,
    });
  }
  function ellipsoid(options: {
    center: IsoPoint;
    radius: IsoPoint;
    material: Material;
  }) {
    function point(coordinates: { longitude: number; latitude: number }) {
      const { longitude, latitude } = coordinates;
      return world({
        x:
          options.center.x +
          options.radius.x * Math.sin(latitude) * Math.cos(longitude),
        y:
          options.center.y +
          options.radius.y * Math.sin(latitude) * Math.sin(longitude),
        z: options.center.z + options.radius.z * Math.cos(latitude),
      });
    }
    const columns = options.radius.z > 0.06 ? 24 : 12;
    const rows = options.radius.z > 0.06 ? 12 : 8;
    const longitudeStep = (Math.PI * 2) / columns;
    const latitudeStep = Math.PI / rows;
    for (const index of Array.from(
      { length: columns * rows },
      (_, index) => index
    )) {
      const longitude = (index % columns) * longitudeStep;
      const latitude = Math.floor(index / columns) * latitudeStep;
      face({
        material: options.material,
        points: [
          point({ longitude, latitude }),
          point({ longitude, latitude: latitude + latitudeStep }),
          point({
            longitude: longitude + longitudeStep,
            latitude: latitude + latitudeStep,
          }),
          point({ longitude: longitude + longitudeStep, latitude }),
        ],
      });
    }
  }
  function bone(options: {
    from: IsoPoint;
    to: IsoPoint;
    radius: number;
    material?: Material;
  }) {
    const from = world(options.from);
    const to = world(options.to);
    const delta = { x: to.x - from.x, y: to.y - from.y, z: to.z - from.z };
    const length = Math.hypot(delta.x, delta.y, delta.z);
    const axis = {
      x: delta.x / length,
      y: delta.y / length,
      z: delta.z / length,
    };
    const cross =
      Math.hypot(axis.x, axis.y) > 0.01
        ? { x: -axis.y, y: axis.x, z: 0 }
        : { x: 1, y: 0, z: 0 };
    const crossLength = Math.hypot(cross.x, cross.y, cross.z);
    const u = {
      x: cross.x / crossLength,
      y: cross.y / crossLength,
      z: cross.z / crossLength,
    };
    const v = {
      x: axis.y * u.z - axis.z * u.y,
      y: axis.z * u.x - axis.x * u.z,
      z: axis.x * u.y - axis.y * u.x,
    };
    function rim(coordinates: { center: IsoPoint; angle: number }) {
      const { center, angle } = coordinates;
      return {
        x:
          center.x +
          options.radius * (u.x * Math.cos(angle) + v.x * Math.sin(angle)),
        y:
          center.y +
          options.radius * (u.y * Math.cos(angle) + v.y * Math.sin(angle)),
        z:
          center.z +
          options.radius * (u.z * Math.cos(angle) + v.z * Math.sin(angle)),
      };
    }
    for (const index of Array.from({ length: 8 }, (_, index) => index)) {
      const angle = (index * Math.PI) / 4;
      face({
        material: options.material ?? "bone",
        points: [
          rim({ center: from, angle }),
          rim({ center: from, angle: angle + Math.PI / 4 }),
          rim({ center: to, angle: angle + Math.PI / 4 }),
          rim({ center: to, angle }),
        ],
      });
    }
  }
  function joint(center: IsoPoint) {
    ellipsoid({
      center,
      radius: { x: 0.027, y: 0.048, z: 0.014 },
      material: "joint",
    });
  }
  ellipsoid({
    center: { x: 0, y: 0, z: 0.875 },
    radius: { x: 0.145, y: 0.23, z: 0.075 },
    material: "bone",
  });
  ellipsoid({
    center: { x: 0, y: 0.065, z: 0.803 },
    radius: { x: 0.093, y: 0.155, z: 0.026 },
    material: "bone",
  });
  for (const side of [-1, 1]) {
    ellipsoid({
      center: { x: side * 0.067, y: 0.204, z: 0.866 },
      radius: { x: 0.044, y: 0.029, z: 0.025 },
      material: "recess",
    });
    ellipsoid({
      center: { x: side * 0.102, y: 0.16, z: 0.835 },
      radius: { x: 0.028, y: 0.07, z: 0.017 },
      material: "bone",
    });
    ellipsoid({
      center: { x: side * 0.092, y: 0.01, z: 0.5 },
      radius: { x: 0.083, y: 0.14, z: 0.047 },
      material: "bone",
    });
    bone({
      from: { x: 0, y: 0.07, z: 0.754 },
      to: { x: side * 0.21, y: 0, z: 0.735 },
      radius: 0.018,
    });
    for (const rib of Array.from({ length: 6 }, (_, index) => index)) {
      const reach = 0.2 - Math.abs(rib - 1) * 0.012;
      for (const step of Array.from({ length: 10 }, (_, index) => index)) {
        function point(index: number) {
          const angle = (index * Math.PI) / 10;
          return {
            x: side * Math.sin(angle) * reach,
            y: -Math.cos(angle) * 0.17,
            z: 0.716 - rib * 0.029 - Math.sin(angle) * 0.018,
          };
        }
        bone({ from: point(step), to: point(step + 1), radius: 0.009 });
      }
    }
    const shoulder = {
      x: side * blend({ resting: 0.22, shy: 0.19 }),
      y: shy * 0.04,
      z: 0.73 + shy * 0.015,
    };
    const elbow = {
      x: side * blend({ resting: 0.35, shy: 0.22 }),
      y: blend({ resting: 0.08, shy: 0.24 }),
      z: blend({ resting: side < 0 ? 0.56 : 0.64, shy: 0.57 }),
    };
    const wrist = {
      x: side * blend({ resting: side < 0 ? 0.25 : 0.39, shy: 0.035 }),
      y: blend({ resting: 0.2, shy: side < 0 ? 0.35 : 0.4 }),
      z: blend({ resting: side < 0 ? 0.49 : 0.8, shy: 0.455 }),
    };
    bone({ from: shoulder, to: elbow, radius: 0.022 });
    bone({ from: elbow, to: wrist, radius: 0.016 });
    bone({
      from: { ...elbow, x: elbow.x + 0.024 },
      to: { ...wrist, x: wrist.x + 0.017 },
      radius: 0.009,
    });
    for (const point of [shoulder, elbow, wrist]) joint(point);
    ellipsoid({
      center: wrist,
      radius: { x: 0.035, y: 0.04, z: 0.025 },
      material: "bone",
    });
    for (const finger of Array.from({ length: 4 }, (_, index) => index)) {
      const from = {
        x: wrist.x - 0.025 + finger * 0.018,
        y: wrist.y,
        z: wrist.z + blend({ resting: side < 0 ? -0.02 : 0.02, shy: -0.02 }),
      };
      bone({
        from,
        to: {
          ...from,
          y: from.y + 0.035,
          z: from.z + blend({ resting: side < 0 ? -0.03 : 0.03, shy: -0.03 }),
        },
        radius: 0.006,
      });
    }
    const hip = { x: side * 0.1, y: 0.01, z: 0.49 };
    const knee = {
      x: side * blend({ resting: 0.15, shy: 0.035 }),
      y: 0.03,
      z: 0.285,
    };
    const ankle = {
      x: side * blend({ resting: 0.16, shy: 0.12 }),
      y: 0.06,
      z: 0.075,
    };
    bone({ from: hip, to: knee, radius: 0.026 });
    bone({ from: knee, to: ankle, radius: 0.019 });
    bone({
      from: { ...knee, x: knee.x + side * 0.025 },
      to: { ...ankle, x: ankle.x + side * 0.018 },
      radius: 0.01,
    });
    joint(knee);
    joint(ankle);
    ellipsoid({
      center: { ...ankle, y: 0.15, z: 0.055 },
      radius: { x: 0.045, y: 0.15, z: 0.023 },
      material: "bone",
    });
  }
  ellipsoid({
    center: { x: 0, y: 0.22, z: 0.831 },
    radius: { x: 0.018, y: 0.012, z: 0.014 },
    material: "recess",
  });
  for (const tooth of Array.from({ length: 5 }, (_, index) => index)) {
    bone({
      from: { x: (tooth - 2) * 0.026, y: 0.215, z: 0.811 },
      to: { x: (tooth - 2) * 0.026, y: 0.216, z: 0.793 },
      radius: 0.009,
    });
  }
  for (const vertebra of Array.from({ length: 12 }, (_, index) => index)) {
    ellipsoid({
      center: { x: 0, y: -0.15, z: 0.51 + vertebra * 0.025 },
      radius: { x: 0.025, y: 0.035, z: 0.01 },
      material: "bone",
    });
  }
  bone({
    from: { x: 0, y: 0.17, z: 0.73 },
    to: { x: 0, y: 0.17, z: 0.56 },
    radius: 0.014,
  });
  return {
    faces: faces.toSorted((a, b) => a.depth - b.depth),
  };
}
