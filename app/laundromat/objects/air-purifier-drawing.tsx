import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { AQI_BAND_COLORS } from "@/lib/laundromat/weather/aqi-band-colors";
import { getAqiBand } from "@/lib/laundromat/weather/get-aqi-band";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";
import { SteamWisps } from "./steam-wisps";

const PLINTH_HEIGHT = 0.1;
const PLINTH_INSET = 0.05;
const CAP_HEIGHT = 0.12;
const GRILLE = { bottom: 0.3, top: 1.38, inset: 0.08 };
const SLOT = { width: 2.2, height: 0.8, gapX: 1.2, gapY: 1.4 };
const DISPLAY = { top: 1.62, height: 0.16, inset: 0.12 };
const FAN_RINGS = [0.78, 0.55, 0.32];
const SCREW_RADIUS = 0.5;

type AirPurifierDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  aqi: number;
  details: SceneConfig["details"]["airPurifier"];
};

/** Draw a tower air purifier standing in a corner: a plinth, a grille wrapping its two visible faces, a small display showing `aqi`, and a fan under the top grille with a status ring in the colour of the AQI band, blowing clean air upward at full quality. */
export function AirPurifierDrawing(props: AirPurifierDrawingProps) {
  const { quality } = useRenderQuality();
  const { projection, details } = props;
  const { position, size } = props.laidOut.object;
  const { unit } = projection;
  const isLite = quality === "lite";
  const bodyBottom = position.z + PLINTH_HEIGHT;
  const capBottom = position.z + size.h - CAP_HEIGHT;
  const topZ = position.z + size.h;
  const center = {
    x: position.x + size.w / 2,
    y: position.y + size.d / 2,
  };
  const radius = Math.min(size.w, size.d) / 2;
  const fan = FAN_RINGS.map((ratio) =>
    getIsoEllipse({
      center: { ...center, z: topZ },
      radius: radius * ratio,
      projection,
    })
  );
  const [outerRing] = fan;
  const bandColor = AQI_BAND_COLORS[getAqiBand(props.aqi)];
  const front = getFacePlane({
    plane: "front",
    origin: { x: position.x, y: position.y + size.d, z: topZ },
    projection,
  });
  const side = getFacePlane({
    plane: "side",
    origin: { x: position.x + size.w, y: position.y + size.d, z: topZ },
    projection,
  });
  const faces = [
    { key: "front", plane: front, widthPx: size.w * unit },
    { key: "side", plane: side, widthPx: size.d * unit },
  ];
  const grilleTopPx = (topZ - (position.z + GRILLE.top)) * unit;
  const grilleBottomPx = (topZ - (position.z + GRILLE.bottom)) * unit;
  const seamsPx = [capBottom, bodyBottom + 0.12].map((z) => (topZ - z) * unit);

  function grilleSlots(widthPx: number) {
    const insetPx = GRILLE.inset * unit;
    const columns = Math.floor(
      (widthPx - 2 * insetPx + SLOT.gapX) / (SLOT.width + SLOT.gapX)
    );
    const rows = Math.floor(
      (grilleBottomPx - grilleTopPx - 2 + SLOT.gapY) / (SLOT.height + SLOT.gapY)
    );
    const usedWidth = columns * (SLOT.width + SLOT.gapX) - SLOT.gapX;
    const left = (widthPx - usedWidth) / 2;
    return Array.from({ length: rows * columns }, (_, index) => ({
      x: left + (index % columns) * (SLOT.width + SLOT.gapX),
      y:
        grilleTopPx +
        1 +
        Math.floor(index / columns) * (SLOT.height + SLOT.gapY),
    }));
  }

  return (
    <g data-air-purifier strokeLinejoin="round">
      <g className={partStroke(props.highlighted)} strokeWidth={1}>
        <IsoBox
          position={{
            x: position.x + PLINTH_INSET,
            y: position.y + PLINTH_INSET,
            z: position.z,
          }}
          size={{
            w: size.w - 2 * PLINTH_INSET,
            d: size.d - 2 * PLINTH_INSET,
            h: PLINTH_HEIGHT,
          }}
          projection={projection}
          bevel={false}
        />
        <IsoBox
          position={{ ...position, z: bodyBottom }}
          size={{ ...size, h: size.h - PLINTH_HEIGHT }}
          projection={projection}
        />
      </g>
      {faces.map((face) => {
        const insetPx = GRILLE.inset * unit;
        return (
          <g key={face.key} transform={face.plane.transform}>
            {seamsPx.map((y) => (
              <line
                key={y}
                x1={0}
                y1={y}
                x2={face.widthPx}
                y2={y}
                className="stroke-[var(--lm-detail)]"
                strokeWidth={0.6}
              />
            ))}
            <rect
              x={insetPx}
              y={grilleTopPx}
              width={face.widthPx - 2 * insetPx}
              height={grilleBottomPx - grilleTopPx}
              rx={1.5}
              className="fill-[var(--lm-shade-1)] stroke-[var(--lm-detail)]"
              strokeWidth={0.6}
            />
            <g className="fill-[var(--lm-recess)] stroke-none">
              {grilleSlots(face.widthPx).map((slot) => (
                <rect
                  key={`${slot.x},${slot.y}`}
                  x={slot.x}
                  y={slot.y}
                  width={SLOT.width}
                  height={SLOT.height}
                  rx={0.4}
                />
              ))}
            </g>
            {[insetPx * 0.5, face.widthPx - insetPx * 0.5].map((x) =>
              [grilleTopPx - 1.6, grilleBottomPx + 1.6].map((y) => (
                <g key={`${x},${y}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r={SCREW_RADIUS * 2}
                    className="fill-none stroke-[var(--lm-detail)]"
                    strokeWidth={0.4}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={SCREW_RADIUS}
                    className="fill-[var(--lm-line)] stroke-none"
                  />
                </g>
              ))
            )}
          </g>
        );
      })}
      <g transform={side.transform}>
        <rect
          x={DISPLAY.inset * unit}
          y={(topZ - (position.z + DISPLAY.top)) * unit}
          width={size.d * unit - 2 * DISPLAY.inset * unit}
          height={DISPLAY.height * unit}
          rx={1}
          className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
          strokeWidth={0.5}
        />
        <text
          x={(size.d * unit) / 2}
          y={
            (topZ - (position.z + DISPLAY.top)) * unit +
            DISPLAY.height * unit * 0.72
          }
          textAnchor="middle"
          fontSize={DISPLAY.height * unit * 0.7}
          className="fill-[var(--lm-ink-hi)] stroke-none font-[family-name:var(--lm-font-mono)] tabular-nums"
        >
          {props.aqi}
        </text>
      </g>
      <ellipse {...outerRing} className="fill-[var(--lm-recess)] stroke-none" />
      <g className="fill-none stroke-[var(--lm-detail)]" strokeWidth={0.6}>
        {fan.slice(1).map((ring) => (
          <ellipse key={ring.rx} {...ring} />
        ))}
      </g>
      <ellipse
        {...fan[1]}
        data-lm-motion
        className="fill-none stroke-[var(--lm-ink)]"
        strokeWidth={0.8}
        strokeDasharray="2 1.4"
        style={
          isLite
            ? undefined
            : { animation: `lm-stream ${details.fanSeconds}s linear infinite` }
        }
      />
      <ellipse
        {...outerRing}
        className="fill-none"
        strokeWidth={1.2}
        style={{ stroke: bandColor }}
      />
      {!isLite && (
        <SteamWisps
          x={outerRing.cx}
          y={outerRing.cy - outerRing.ry}
          height={size.h * unit * 0.45}
          opacity={details.airflowOpacity}
          riseSeconds={3}
        />
      )}
    </g>
  );
}
