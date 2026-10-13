import { useId } from "react";

import type { getTableLampShape } from "@/lib/laundromat/first-visit/get-table-lamp-shape";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { IsoPoint, IsoSize } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

const PALETTES = {
  off: {
    light: "var(--lm-face-top)",
    mid: "var(--lm-face)",
    dark: "var(--lm-shade-1)",
    deep: "var(--lm-wall)",
  },
  on: {
    light: "#ffe2b0",
    mid: "#f9b04f",
    dark: "#e0832a",
    deep: "#a8560f",
  },
};
const STEM_OUTLINE_FROM = 2;
const CHROME = { light: "#ffffff", mid: "#9aa3ad", dark: "#4b525a" };
const SPILL = { reachPerDome: 1.05, opacity: 0.85 };
const SPECULAR = { across: 0.3, down: 0.32, rx: 0.13, ry: 0.09, opacity: 0.25 };

type TableLampDrawingProps = {
  shape: ReturnType<typeof getTableLampShape>;
  center: { x: number; y: number };
  table: { position: IsoPoint; size: IsoSize };
  domeRadius: number;
  projection: IsoProjection;
  lampOn: boolean;
  lampColor: string;
  highlighted: boolean;
  glideMs: number;
};

/** Draw the mushroom table lamp in `shape` on the table (foot, plate, trumpet stem, dome and chrome finial) in the room's tones, crossfading to warm orange with the dome glowing and light spilling onto the table top while `lampOn`. */
export function TableLampDrawing(props: TableLampDrawingProps) {
  const id = useId();
  const { shape, center, table, projection } = props;
  const tableTop = table.position.z + table.size.h;
  const spill = getIsoEllipse({
    center: { ...center, z: tableTop },
    radius: props.domeRadius * SPILL.reachPerDome,
    projection,
  });
  const tableTopFace = [
    { x: table.position.x, y: table.position.y },
    { x: table.position.x + table.size.w, y: table.position.y },
    { x: table.position.x + table.size.w, y: table.position.y + table.size.d },
    { x: table.position.x, y: table.position.y + table.size.d },
  ].map((corner) =>
    projectIsoPoint({ point: { ...corner, z: tableTop }, projection })
  );
  const domeXs = shape.dome.map((point) => point.x);
  const domeYs = shape.dome.map((point) => point.y);
  const domeBox = {
    left: Math.min(...domeXs),
    top: Math.min(...domeYs),
    width: Math.max(...domeXs) - Math.min(...domeXs),
    height: Math.max(...domeYs) - Math.min(...domeYs),
  };
  const onLayer = {
    opacity: props.lampOn ? 1 : 0,
    transition: `opacity ${props.glideMs}ms`,
  };
  function layers(draw: (key: "off" | "on") => React.ReactNode) {
    return (["off", "on"] as const).map((key) => (
      <g
        key={key}
        className="pointer-events-none"
        style={key === "on" ? onLayer : undefined}
      >
        {draw(key)}
      </g>
    ));
  }
  const outline = cn(
    "fill-none stroke-[var(--lm-line)] transition-[stroke] duration-300",
    props.highlighted && "stroke-[var(--lm-ink-hi)]"
  );

  return (
    <g data-table-lamp stroke="none">
      <defs>
        {(["off", "on"] as const).map((key) => {
          const palette = PALETTES[key];
          return (
            <g key={key}>
              <linearGradient
                id={`${id}-${key}-round`}
                x1={0}
                y1={0}
                x2={1}
                y2={0}
              >
                <stop offset={0} style={{ stopColor: palette.mid }} />
                <stop offset={0.22} style={{ stopColor: palette.light }} />
                <stop offset={0.6} style={{ stopColor: palette.mid }} />
                <stop offset={1} style={{ stopColor: palette.dark }} />
              </linearGradient>
              <linearGradient
                id={`${id}-${key}-foot`}
                x1={0}
                y1={0}
                x2={1}
                y2={0}
              >
                <stop offset={0} style={{ stopColor: palette.dark }} />
                <stop offset={0.3} style={{ stopColor: palette.mid }} />
                <stop offset={1} style={{ stopColor: palette.deep }} />
              </linearGradient>
              <radialGradient
                id={`${id}-${key}-dome`}
                cx={key === "on" ? 0.5 : 0.4}
                cy={key === "on" ? 0.75 : 0.35}
                fx={key === "on" ? 0.5 : 0.32}
                fy={key === "on" ? 0.8 : 0.25}
                r={0.8}
              >
                <stop offset={0} style={{ stopColor: palette.light }} />
                <stop offset={0.55} style={{ stopColor: palette.mid }} />
                <stop offset={1} style={{ stopColor: palette.dark }} />
              </radialGradient>
            </g>
          );
        })}
        <radialGradient id={`${id}-specular`}>
          <stop offset={0} stopColor="white" stopOpacity={SPECULAR.opacity} />
          <stop offset={1} stopColor="white" stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${id}-chrome`} fx={0.35} fy={0.3}>
          <stop offset={0} stopColor={CHROME.light} />
          <stop offset={0.55} stopColor={CHROME.mid} />
          <stop offset={1} stopColor={CHROME.dark} />
        </radialGradient>
        <radialGradient id={`${id}-spill`}>
          <stop offset={0} stopColor={props.lampColor} />
          <stop offset={1} stopColor={props.lampColor} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`${id}-table-top`}>
          <polygon points={toSvgPoints(tableTopFace)} />
        </clipPath>
      </defs>
      <ellipse
        className="pointer-events-none"
        clipPath={`url(#${id}-table-top)`}
        fill={`url(#${id}-spill)`}
        {...spill}
        style={{
          opacity: props.lampOn ? SPILL.opacity : 0,
          transition: `opacity ${props.glideMs}ms`,
        }}
      />
      {layers((key) => (
        <path fill={`url(#${id}-${key}-foot)`} d={shape.foot.body} />
      ))}
      <path className={outline} d={shape.foot.body} />
      {layers((key) => (
        <>
          <path fill={`url(#${id}-${key}-round)`} d={shape.plate.body} />
          <ellipse style={{ fill: PALETTES[key].light }} {...shape.plate.top} />
        </>
      ))}
      <path className={outline} d={shape.plate.body} />
      {layers((key) => (
        <path fill={`url(#${id}-${key}-round)`} d={shape.stem} />
      ))}
      <g className={outline}>
        <polyline
          points={toSvgPoints(shape.stemLeft.slice(STEM_OUTLINE_FROM))}
        />
        <polyline
          points={toSvgPoints(shape.stemRight.slice(STEM_OUTLINE_FROM))}
        />
      </g>
      <path className="fill-none stroke-[var(--lm-detail)]" d={shape.seam} />
      {layers((key) => (
        <polygon
          fill={`url(#${id}-${key}-dome)`}
          points={toSvgPoints(shape.dome)}
        />
      ))}
      <ellipse
        className="pointer-events-none"
        fill={`url(#${id}-specular)`}
        cx={domeBox.left + domeBox.width * SPECULAR.across}
        cy={domeBox.top + domeBox.height * SPECULAR.down}
        rx={domeBox.width * SPECULAR.rx}
        ry={domeBox.height * SPECULAR.ry}
      />
      <polygon className={outline} points={toSvgPoints(shape.dome)} />
      <circle fill={`url(#${id}-chrome)`} {...shape.finial} />
      <circle className={outline} {...shape.finial} />
    </g>
  );
}
