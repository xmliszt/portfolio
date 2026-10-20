import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { TIP_COINS_CENTS } from "@/lib/laundromat/tip/tip-amounts";
import type { CoinMachinePhase } from "@/lib/laundromat/tip/tip-token";

import { CoinMachineToken } from "./coin-machine-token";
import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";

const WALL_PLATE = { margin: 0.06, depth: 0.04 };
const TRAY = { height: 0.26, lip: 0.1, inset: 0.14 };
const COIN_LABELS = TIP_COINS_CENTS.map((cents) => String(cents / 100));
const SCREW_INSET = 3;

type CoinMachineDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  phase: CoinMachinePhase;
};

export function CoinMachineDrawing(props: CoinMachineDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const { unit } = projection;
  const bodyDepth = size.d - WALL_PLATE.depth;
  const body = {
    position: { x: p.x, y: p.y + WALL_PLATE.depth, z: p.z },
    size: { w: size.w, d: bodyDepth, h: size.h },
  };
  const front = getFacePlane({
    plane: "front",
    origin: { x: p.x, y: p.y + size.d, z: p.z + size.h },
    projection,
  });
  const side = getFacePlane({
    plane: "side",
    origin: { x: p.x + size.w, y: p.y + size.d, z: p.z + size.h },
    projection,
  });
  const width = size.w * unit;
  const height = size.h * unit;
  const depth = bodyDepth * unit;
  const seamY = height * 0.62;
  const plate = { x: 3, y: 3, width: width - 6, height: seamY - 6 };
  const screen = { x: 6, y: 6, width: width - 12, height: 9 };
  const slot = { x: width - 10, y: 19, width: 4, height: 11 };
  const coinRadius = 2.1;
  const coinY = plate.y + plate.height - 6;
  const coinSpacing = (width - 12 - 4 * 2 * coinRadius) / 3 + 2 * coinRadius;
  const tray = {
    x: TRAY.inset * unit,
    y: height - TRAY.height * unit - 4,
    width: width - 2 * TRAY.inset * unit,
    height: TRAY.height * unit,
  };
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      <IsoBox
        position={{
          x: p.x - WALL_PLATE.margin,
          y: p.y,
          z: p.z - WALL_PLATE.margin,
        }}
        size={{
          w: size.w + 2 * WALL_PLATE.margin,
          d: WALL_PLATE.depth,
          h: size.h + 2 * WALL_PLATE.margin,
        }}
        projection={projection}
        bevel={false}
      />
      <IsoBox {...body} projection={projection} />
      <g transform={front.transform} strokeWidth={0.75}>
        <line x1={0} y1={seamY} x2={width} y2={seamY} />
        <rect
          {...plate}
          rx={1}
          className="fill-[var(--lm-shade-1)] stroke-[var(--lm-detail)]"
        />
        <rect
          {...screen}
          rx={1}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-line)]"
        />
        <text
          x={screen.x + screen.width / 2}
          y={screen.y + screen.height / 2 + 0.3}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-[var(--lm-accent)] stroke-none font-[family-name:var(--lm-font-mono)]"
          fontSize={5.5}
        >
          {props.phase.kind === "idle" ? "TIPS" : "THANKS"}
        </text>
        <rect
          {...slot}
          rx={1.5}
          className="fill-[var(--lm-face)] stroke-[var(--lm-ink)]"
        />
        <line
          x1={slot.x + slot.width / 2}
          y1={slot.y + 2}
          x2={slot.x + slot.width / 2}
          y2={slot.y + slot.height - 2}
          className="stroke-[var(--lm-recess)]"
          strokeWidth={1.2}
          strokeLinecap="round"
        />
        <text
          x={6}
          y={slot.y + slot.height / 2}
          dominantBaseline="middle"
          className="fill-[var(--lm-detail)] stroke-none font-[family-name:var(--lm-font-mono)]"
          fontSize={4.5}
        >
          S$
        </text>
        {COIN_LABELS.map((label, index) => {
          const cx = 6 + coinRadius + index * coinSpacing;
          return (
            <g key={label}>
              <circle
                cx={cx}
                cy={coinY}
                r={coinRadius}
                className="fill-[var(--lm-face)] stroke-[var(--lm-ink)]"
              />
              <text
                x={cx}
                y={coinY + 0.2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-mono)]"
                fontSize={label.length > 1 ? 2.2 : 2.8}
              >
                {label}
              </text>
            </g>
          );
        })}
        {[
          [plate.x + SCREW_INSET, plate.y + SCREW_INSET],
          [plate.x + plate.width - SCREW_INSET, plate.y + SCREW_INSET],
          [plate.x + SCREW_INSET, plate.y + plate.height - SCREW_INSET],
          [
            plate.x + plate.width - SCREW_INSET,
            plate.y + plate.height - SCREW_INSET,
          ],
        ].map(([cx, cy]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={0.5}
            className="fill-[var(--lm-line)] stroke-[var(--lm-detail)]"
            strokeWidth={0.3}
          />
        ))}
        <rect
          x={width / 2 - 3}
          y={seamY + 4}
          width={6}
          height={3}
          rx={1}
          className="fill-[var(--lm-face)] stroke-[var(--lm-line)]"
        />
        <rect
          {...tray}
          rx={1.5}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-line)]"
        />
        <CoinMachineToken phase={props.phase} tray={tray} />
      </g>
      <g transform={side.transform} strokeWidth={0.75}>
        <line x1={0} y1={seamY} x2={depth} y2={seamY} />
        <circle
          cx={depth / 2}
          cy={seamY - 6}
          r={1.2}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        />
      </g>
      <IsoBox
        position={{
          x: p.x + TRAY.inset,
          y: p.y + size.d,
          z: p.z + 4 / unit,
        }}
        size={{
          w: size.w - 2 * TRAY.inset,
          d: TRAY.lip,
          h: TRAY.height * 0.45,
        }}
        projection={projection}
        bevel={false}
      />
    </g>
  );
}
