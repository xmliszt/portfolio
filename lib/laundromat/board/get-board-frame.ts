import type { FaceRect } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);

const FOOT = { radius: 0.06, inset: 0.08 };
export const BOARD_PANEL_BOTTOM_RATIO = 0.3;

const PANEL = { thickness: 0.14, hingeDrop: 0.12 };
const RAIL = { width: 0.07, inset: 0.12 };
const STRETCHER_Z = 0.42;
const REAR_BRACE_Z = 0.95;
const HINGE_LENGTH = 0.2;
const BEZEL = { side: 0.08, top: 0.08, chin: 0.24 };

type Segment = { from: IsoPoint; to: IsoPoint };

/** Return the scene-pixel parts of an A-frame poster stand in the box `position` + `size`: the panel leans back by `leanDeg` with its front facing +y, the rear leg splays back to the box's far edge, and `face` maps face pixels on the panel front to scene pixels. */
export function getBoardFrame(options: {
  position: IsoPoint;
  size: IsoSize;
  leanDeg: number;
  projection: IsoProjection;
}) {
  const { position: p, size, projection } = options;
  const { unit } = projection;
  const lean = (options.leanDeg * Math.PI) / 180;
  const x0 = p.x;
  const x1 = p.x + size.w;
  const footZ = p.z + FOOT.radius;
  const frontFootY = p.y + size.d - FOOT.inset;
  const rearFootY = p.y + FOOT.inset;
  const panelBottom = p.z + size.h * BOARD_PANEL_BOTTOM_RATIO;
  const panelTop = p.z + size.h - PANEL.hingeDrop;

  function at(point: IsoPoint) {
    return projectIsoPoint({ point, projection });
  }
  function onPanel(x: number, z: number, depth: number): IsoPoint {
    return {
      x,
      y: frontFootY - (z - footZ) * Math.tan(lean) - depth * Math.cos(lean),
      z: z - depth * Math.sin(lean),
    };
  }
  const hingeY = onPanel(x0, panelTop, PANEL.thickness).y;
  function onRearLeg(x: number, z: number): IsoPoint {
    const t = (z - footZ) / (panelTop - footZ);
    return { x, y: rearFootY + (hingeY - rearFootY) * t, z };
  }
  function project(segment: Segment) {
    return { from: at(segment.from), to: at(segment.to) };
  }

  const railMid = PANEL.thickness / 2;
  const frontRailXs = [x0 + RAIL.width / 2, x1 - RAIL.width / 2];
  const rearRailXs = [x0 + RAIL.inset, x1 - RAIL.inset];
  const rearRails = rearRailXs.map((x) =>
    project({ from: onRearLeg(x, footZ), to: onRearLeg(x, panelTop) })
  );
  const rearBrace = project({
    from: onRearLeg(rearRailXs[0], REAR_BRACE_Z),
    to: onRearLeg(rearRailXs[1], REAR_BRACE_Z),
  });
  const stretchers = frontRailXs.map((x, index) =>
    project({
      from: onPanel(x, STRETCHER_Z, railMid),
      to: onRearLeg(rearRailXs[index], STRETCHER_Z),
    })
  );
  const frontRails = frontRailXs.map((x) =>
    project({
      from: onPanel(x, footZ, railMid),
      to: onPanel(x, panelBottom, railMid),
    })
  );
  const footBars = {
    rear: project({
      from: { x: x0, y: rearFootY, z: footZ },
      to: { x: x1, y: rearFootY, z: footZ },
    }),
    front: project({
      from: onPanel(x0, footZ, railMid),
      to: onPanel(x1, footZ, railMid),
    }),
  };
  const hinges = rearRailXs.map((x) =>
    project({
      from: onPanel(x - HINGE_LENGTH / 2, panelTop, PANEL.thickness),
      to: onPanel(x + HINGE_LENGTH / 2, panelTop, PANEL.thickness),
    })
  );

  const panel = {
    front: [
      onPanel(x0, panelTop, 0),
      onPanel(x1, panelTop, 0),
      onPanel(x1, panelBottom, 0),
      onPanel(x0, panelBottom, 0),
    ].map(at),
    side: [
      onPanel(x1, panelTop, 0),
      onPanel(x1, panelTop, PANEL.thickness),
      onPanel(x1, panelBottom, PANEL.thickness),
      onPanel(x1, panelBottom, 0),
    ].map(at),
    top: [
      onPanel(x0, panelTop, 0),
      onPanel(x0, panelTop, PANEL.thickness),
      onPanel(x1, panelTop, PANEL.thickness),
      onPanel(x1, panelTop, 0),
    ].map(at),
    sideSeam: project({
      from: onPanel(x1, panelTop, PANEL.thickness * 0.4),
      to: onPanel(x1, panelBottom, PANEL.thickness * 0.4),
    }),
    topSeam: project({
      from: onPanel(x0, panelTop, PANEL.thickness * 0.4),
      to: onPanel(x1, panelTop, PANEL.thickness * 0.4),
    }),
  };

  const origin = at(onPanel(x0, panelTop, 0));
  const across = { x: COS_30, y: SIN_30 };
  const down = {
    x: -Math.sin(lean) * COS_30,
    y: Math.sin(lean) * SIN_30 + Math.cos(lean),
  };
  const width = size.w * unit;
  const height = ((panelTop - panelBottom) / Math.cos(lean)) * unit;
  const screen = {
    x: BEZEL.side * unit,
    y: BEZEL.top * unit,
    width: width - 2 * BEZEL.side * unit,
    height: height - (BEZEL.top + BEZEL.chin) * unit,
  };
  const rects = {
    body: { x: 0, y: 0, width, height },
    screen,
    chin: {
      x: screen.x,
      y: screen.y + screen.height,
      width: screen.width,
      height: height - screen.y - screen.height,
    },
  } satisfies { [part: string]: FaceRect };

  return {
    footRadiusPx: FOOT.radius * unit,
    railWidthPx: RAIL.width * unit,
    rearRails,
    rearBrace,
    stretchers,
    frontRails,
    footBars,
    hinges,
    panel,
    cable: {
      from: at(onPanel(x1 - 0.3, panelBottom, PANEL.thickness * 0.6)),
      bend: at({ x: x1 - 0.32, y: (frontFootY + rearFootY) / 2, z: footZ }),
      to: at({ x: x1 - 0.1, y: rearFootY - 0.5, z: p.z }),
    },
    floorSpill: {
      center: { x: (x0 + x1) / 2, y: frontFootY + 0.35, z: p.z },
      radius: size.w * 0.6,
    },
    face: {
      transform: `matrix(${across.x} ${across.y} ${down.x} ${down.y} ${origin.x} ${origin.y})`,
      rects,
    },
  };
}
