import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import type { CoffeePhase } from "@/lib/laundromat/coffee/get-coffee-phase";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { cn } from "@/lib/utils";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";
import { SteamWisps } from "./steam-wisps";

const TOWER_DEPTH = 0.42;
const HEAD_HEIGHT = 0.36;
const CARAFE = { radius: 0.26, topRadius: 0.21, bottom: 0.32, top: 0.9 };

type CoffeeMachineDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlightedId: string | undefined;
  phase: CoffeePhase;
  details: SceneConfig["details"]["coffee"];
};

export function CoffeeMachineDrawing(props: CoffeeMachineDrawingProps) {
  const { object, face } = props.laidOut;
  if (face?.target !== "coffee") return null;
  const { projection, phase, details } = props;
  const { position: p, size } = object;
  const { unit } = projection;
  const isHighlighted = props.highlightedId === object.id;
  const isSwitchHighlighted = props.highlightedId === `${object.id}-switch`;
  const isLive = phase.kind !== "idle";
  const fill = (() => {
    switch (phase.kind) {
      case "idle":
        return 0;
      case "brewing":
        return phase.progress;
      case "hot":
        return 1;
      default: {
        const unhandled: never = phase;
        return unhandled;
      }
    }
  })();
  const carafeCenter = { x: p.x + size.w / 2, y: p.y + TOWER_DEPTH + 0.3 };
  const carafeBottom = p.z + CARAFE.bottom;
  const carafeTop = p.z + CARAFE.top;
  const liquidTop =
    carafeBottom + 0.04 + (carafeTop - carafeBottom - 0.12) * fill;
  const liquid = getIsoCylinder({
    center: carafeCenter,
    bottom: carafeBottom + 0.03,
    top: liquidTop,
    radius: CARAFE.radius - 0.03,
    topRadius: CARAFE.radius - 0.03 - (CARAFE.radius - CARAFE.topRadius) * fill,
    projection,
  });
  const carafe = getIsoCylinder({
    center: carafeCenter,
    bottom: carafeBottom,
    top: carafeTop,
    radius: CARAFE.radius,
    topRadius: CARAFE.topRadius,
    projection,
  });
  const plate = getIsoEllipse({
    center: { ...carafeCenter, z: p.z + face.baseHeight },
    radius: CARAFE.radius + 0.06,
    projection,
  });
  const headBottom = p.z + size.h - HEAD_HEIGHT;
  const spout = getIsoEllipse({
    center: { ...carafeCenter, z: headBottom },
    radius: 0.08,
    projection,
  });
  const tower = getFacePlane({
    plane: "front",
    origin: { x: p.x, y: p.y + TOWER_DEPTH, z: p.z + size.h },
    projection,
  });
  const towerHeight = (size.h - face.baseHeight) * unit;
  const waterWindow = {
    x: 0.08 * unit,
    y: 0.5 * unit,
    width: 0.16 * unit,
    height: towerHeight - 0.62 * unit,
  };
  const handleX = carafe.top.cx + carafe.top.rx;
  const { switch: switchRect } = face.rects;

  return (
    <g data-coffee={phase.kind} strokeLinejoin="round">
      <g className={partStroke(isHighlighted)}>
        <IsoBox
          position={{ x: p.x, y: p.y, z: p.z + face.baseHeight }}
          size={{ w: size.w, d: TOWER_DEPTH, h: size.h - face.baseHeight }}
          projection={projection}
        />
        <IsoBox
          position={p}
          size={{ w: size.w, d: size.d, h: face.baseHeight }}
          projection={projection}
        />
        <ellipse
          {...plate}
          className={cn(
            "fill-[var(--lm-recess)]",
            isLive ? "stroke-[var(--lm-accent)]" : "stroke-[var(--lm-detail)]"
          )}
          strokeOpacity={isLive ? 0.6 : 1}
        />
      </g>
      <g transform={tower.transform} strokeWidth={0.75}>
        <rect
          {...waterWindow}
          rx={2}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-line)]"
        />
        <line
          x1={waterWindow.x + 1}
          y1={waterWindow.y + waterWindow.height * (0.35 + 0.5 * fill)}
          x2={waterWindow.x + waterWindow.width - 1}
          y2={waterWindow.y + waterWindow.height * (0.35 + 0.5 * fill)}
          className="stroke-[var(--lm-ink)]"
        />
        {[0.25, 0.5, 0.75].map((at) => (
          <line
            key={at}
            x1={waterWindow.x + waterWindow.width}
            y1={waterWindow.y + waterWindow.height * at}
            x2={waterWindow.x + waterWindow.width + 2}
            y2={waterWindow.y + waterWindow.height * at}
            className="stroke-[var(--lm-detail)]"
          />
        ))}
      </g>
      <g className={partStroke(isHighlighted)}>
        <IsoBox
          position={{ x: p.x + 0.08, y: p.y + TOWER_DEPTH, z: headBottom }}
          size={{ w: size.w - 0.16, d: 0.56, h: HEAD_HEIGHT }}
          projection={projection}
        />
        <ellipse
          {...spout}
          className="fill-[var(--lm-recess)]"
          strokeWidth={0.75}
        />
      </g>
      {phase.kind === "brewing" && (
        <circle
          data-lm-motion
          cx={spout.cx}
          cy={spout.cy + 2}
          r={0.9}
          className="fill-[var(--lm-accent)] stroke-none"
          style={{ animation: `lm-drip ${details.dripMs}ms ease-in infinite` }}
        />
      )}
      <g className={partStroke(isHighlighted)}>
        {fill > 0 && (
          <g className="stroke-[var(--lm-detail)]" strokeWidth={0.75}>
            <path d={liquid.body} className="fill-[var(--lm-detail)]" />
            <ellipse {...liquid.top} className="fill-[var(--lm-recess)]" />
          </g>
        )}
        <path
          d={carafe.body}
          className="fill-[var(--lm-ink-hi)]"
          fillOpacity={0.04}
        />
        <ellipse {...carafe.top} className="fill-[var(--lm-face-top)]" />
        <ellipse
          cx={carafe.top.cx}
          cy={carafe.top.cy}
          rx={carafe.top.rx * 0.7}
          ry={carafe.top.ry * 0.7}
          className="fill-none stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        <path
          d={`M ${handleX - 1} ${carafe.top.cy + 3} C ${handleX + 7} ${carafe.top.cy + 2} ${handleX + 7} ${carafe.base.cy - 6} ${handleX - 1} ${carafe.base.cy - 4}`}
          className="fill-none"
          strokeWidth={1.5}
        />
        <line
          x1={carafe.base.cx - carafe.base.rx + 3}
          y1={carafe.base.cy - 4}
          x2={carafe.top.cx - carafe.top.rx + 3}
          y2={carafe.top.cy + 6}
          className="stroke-[var(--lm-ink-hi)]"
          strokeOpacity={0.15}
        />
      </g>
      {isLive && (
        <SteamWisps
          x={carafe.top.cx}
          y={carafe.top.cy - 1}
          height={10}
          opacity={details.steamOpacity * 0.7}
          riseSeconds={details.steamRiseSeconds}
        />
      )}
      <g transform={face.transform} strokeWidth={0.75}>
        {isSwitchHighlighted && (
          <rect
            {...switchRect}
            rx={2}
            className="fill-none stroke-[var(--lm-ink)]"
            strokeOpacity={0.4}
          />
        )}
        <g
          transform={`translate(${switchRect.x + switchRect.width / 2} ${switchRect.y + switchRect.height / 2})`}
        >
          <rect
            x={-4}
            y={-3}
            width={8}
            height={6}
            rx={1}
            className={cn(
              "fill-[var(--lm-face-top)]",
              partStroke(isSwitchHighlighted)
            )}
          />
          <line
            x1={isLive ? -2 : 2}
            y1={-2}
            x2={isLive ? -2 : 2}
            y2={2}
            className="stroke-[var(--lm-ink)]"
          />
          <circle
            cx={-8}
            cy={0}
            r={1.2}
            className={cn(
              "stroke-none",
              isLive ? "fill-[var(--lm-accent)]" : "fill-[var(--lm-detail)]"
            )}
          />
        </g>
      </g>
    </g>
  );
}
