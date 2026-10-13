import { useId } from "react";

import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getIsoCylinder } from "@/lib/laundromat/get-iso-cylinder";
import { getIsoEllipse } from "@/lib/laundromat/get-iso-ellipse";
import type { BasketContents } from "@/lib/laundromat/laundry/get-basket-contents";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import { CylinderSides } from "./cylinder-sides";
import { partStroke } from "./part-stroke";

const WEAVE_ROWS = [0.2, 0.4, 0.6, 0.8];
const STAKES = 9;
type Tone = "face" | "faceTop" | "detail" | "recess";

type Lump = {
  x: number;
  y: number;
  width: number;
  height: number;
  tone: Tone;
  jitter: number[];
};

const TONE_FILLS = {
  face: "fill-[var(--lm-face)]",
  faceTop: "fill-[var(--lm-face-top)]",
  detail: "fill-[var(--lm-detail)]",
  recess: "fill-[var(--lm-recess)]",
} satisfies { [tone in Tone]: string };

const FABRIC_WAVE = [0.06, -0.04, 0.08, -0.06, 0.05, -0.08, 0.04, -0.03, 0.07];

const DIRTY_LUMPS: Lump[] = [
  { x: 0, y: -0.1, width: 2, height: 1.3, tone: "face", jitter: FABRIC_WAVE },
  {
    x: -0.35,
    y: -0.4,
    width: 1.1,
    height: 0.7,
    tone: "detail",
    jitter: FABRIC_WAVE.toReversed(),
  },
  {
    x: 0.35,
    y: -0.55,
    width: 1.2,
    height: 0.75,
    tone: "faceTop",
    jitter: FABRIC_WAVE,
  },
  {
    x: -0.1,
    y: -0.85,
    width: 0.9,
    height: 0.55,
    tone: "face",
    jitter: FABRIC_WAVE.toReversed(),
  },
  {
    x: 0.5,
    y: -0.95,
    width: 0.45,
    height: 0.35,
    tone: "detail",
    jitter: FABRIC_WAVE,
  },
];

const WET_LUMPS: Lump[] = [
  {
    x: 0,
    y: -0.05,
    width: 2,
    height: 1.2,
    tone: "recess",
    jitter: FABRIC_WAVE,
  },
  {
    x: -0.3,
    y: -0.4,
    width: 1.2,
    height: 0.65,
    tone: "detail",
    jitter: FABRIC_WAVE.toReversed(),
  },
  {
    x: 0.35,
    y: -0.5,
    width: 1.1,
    height: 0.6,
    tone: "recess",
    jitter: FABRIC_WAVE,
  },
  {
    x: 0,
    y: -0.75,
    width: 0.8,
    height: 0.45,
    tone: "detail",
    jitter: FABRIC_WAVE.toReversed(),
  },
];

const FOLDED_LAYERS: { tone: Tone; offset: { x: number; y: number } }[] = [
  { tone: "face", offset: { x: 0, y: 0 } },
  { tone: "detail", offset: { x: 0.03, y: -0.02 } },
  { tone: "faceTop", offset: { x: -0.02, y: 0.03 } },
  { tone: "face", offset: { x: 0.02, y: 0.01 } },
];
const FOLDED_LAYER_HEIGHT = 0.1;

function getLumpPath(options: { lump: Lump; rx: number; ry: number }) {
  const { lump, rx, ry } = options;
  const points = lump.jitter.map((jitter, index) => {
    const angle = (index / lump.jitter.length) * Math.PI * 2;
    return {
      x: (lump.x + Math.cos(angle) * (lump.width / 2) * (1 + jitter)) * rx,
      y: (lump.y + Math.sin(angle) * (lump.height / 2) * (1 + jitter)) * ry,
    };
  });
  const segments = points.map((point, index) => {
    const previous = points.at(index - 1) ?? point;
    const next = points[(index + 1) % points.length];
    const afterNext = points[(index + 2) % points.length];
    const c1 = {
      x: point.x + (next.x - previous.x) / 6,
      y: point.y + (next.y - previous.y) / 6,
    };
    const c2 = {
      x: next.x - (afterNext.x - point.x) / 6,
      y: next.y - (afterNext.y - point.y) / 6,
    };
    return `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${next.x} ${next.y}`;
  });
  return `M ${points[0].x} ${points[0].y} ${segments.join(" ")} Z`.replace(
    /\d+\.\d{3,}/g,
    (value) => Number(value).toFixed(2)
  );
}

function getCreasePath(options: { lump: Lump; rx: number; ry: number }) {
  const { lump, rx, ry } = options;
  return [-0.22, 0.18]
    .map((across) => {
      const x = (lump.x + lump.width * across) * rx;
      const y = (lump.y - lump.height * 0.12) * ry;
      const length = lump.width * 0.16 * rx;
      return `M ${x - length} ${y + ry * 0.08} Q ${x} ${y - ry * 0.12} ${x + length} ${y}`;
    })
    .join(" ");
}

type BasketDrawingProps = {
  laidOut: Pick<LaidOutObject, "object">;
  projection: IsoProjection;
  highlighted: boolean;
  contents: BasketContents;
};

export function BasketDrawing(props: BasketDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const clipId = useId();
  const center = { x: p.x + size.w / 2, y: p.y + size.d / 2 };
  const radius = Math.min(size.w, size.d) / 2;
  const bottomRadius = radius * 0.78;
  const top = p.z + size.h * 0.9;
  const body = getIsoCylinder({
    center,
    bottom: p.z,
    top,
    radius: bottomRadius,
    topRadius: radius,
    projection,
  });
  const inner = getIsoEllipse({
    center: { ...center, z: top },
    radius: radius - 0.07,
    projection,
  });
  const scale = projection.unit / 40;
  function radiusAt(ratio: number) {
    return bottomRadius + (radius - bottomRadius) * ratio;
  }
  const opening = { rx: inner.rx, ry: inner.ry };
  const heapClip = [
    `M ${inner.cx - inner.rx} ${inner.cy}`,
    `A ${inner.rx} ${inner.ry} 0 0 0 ${inner.cx + inner.rx} ${inner.cy}`,
    `L ${inner.cx + inner.rx * 1.1} ${inner.cy - inner.ry * 6}`,
    `L ${inner.cx - inner.rx * 1.1} ${inner.cy - inner.ry * 6}`,
    "Z",
  ].join(" ");

  function renderLumps(options: { lumps: Lump[]; sheen: boolean }) {
    return (
      <g transform={`translate(${inner.cx} ${inner.cy})`}>
        {options.lumps.map((lump) => (
          <g key={`${lump.x},${lump.y}`}>
            <path
              d={getLumpPath({ lump, ...opening })}
              className={TONE_FILLS[lump.tone]}
            />
            <path
              d={getCreasePath({ lump, ...opening })}
              className={cn(
                "fill-none",
                options.sheen
                  ? "stroke-[var(--lm-ink-hi)]"
                  : "stroke-[var(--lm-line)]"
              )}
              strokeOpacity={options.sheen ? 0.22 : 1}
            />
          </g>
        ))}
      </g>
    );
  }

  function renderFolded() {
    const width = radius * 1.15;
    const depth = radius * 0.85;
    return FOLDED_LAYERS.map((layer, index) => {
      const faces = getBoxFaces({
        position: {
          x: center.x - width / 2 + layer.offset.x,
          y: center.y - depth / 2 + layer.offset.y,
          z: top - 0.2 + index * FOLDED_LAYER_HEIGHT,
        },
        size: { w: width, d: depth, h: FOLDED_LAYER_HEIGHT },
        projection,
      });
      const [backLeft, backRight, frontRight, frontLeft] = faces.top;
      return (
        <g key={index}>
          <polygon
            className="fill-[var(--lm-face)]"
            points={toSvgPoints(faces.front)}
          />
          <polygon
            className="fill-[var(--lm-wall)]"
            points={toSvgPoints(faces.side)}
          />
          <polygon
            className={TONE_FILLS[layer.tone]}
            points={toSvgPoints(faces.top)}
          />
          <line
            x1={(backLeft.x + frontLeft.x) / 2}
            y1={(backLeft.y + frontLeft.y) / 2}
            x2={(backRight.x + frontRight.x) / 2}
            y2={(backRight.y + frontRight.y) / 2}
            className="stroke-[var(--lm-detail)]"
          />
        </g>
      );
    });
  }

  function renderContents() {
    switch (props.contents) {
      case "empty":
        return null;
      case "dirty":
        return renderLumps({ lumps: DIRTY_LUMPS, sheen: false });
      case "wet":
        return renderLumps({ lumps: WET_LUMPS, sheen: true });
      case "folded":
        return renderFolded();
      default: {
        const unhandled: never = props.contents;
        return unhandled;
      }
    }
  }

  const sleeve = {
    x: inner.cx + inner.rx * 0.35,
    y: body.top.cy + body.top.ry * 0.85,
  };

  return (
    <g
      data-basket={props.contents}
      className={partStroke(props.highlighted)}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      <defs>
        <clipPath id={clipId}>
          <path d={heapClip} />
        </clipPath>
      </defs>
      <CylinderSides body={body.body} facets={body.facets} />
      <g className="fill-none stroke-[var(--lm-detail)]" strokeWidth={0.75}>
        {WEAVE_ROWS.map((row) => {
          const ellipse = getIsoEllipse({
            center: { ...center, z: p.z + (top - p.z) * row },
            radius: radiusAt(row),
            projection,
          });
          return (
            <path
              key={row}
              d={`M ${ellipse.cx - ellipse.rx} ${ellipse.cy} A ${ellipse.rx} ${ellipse.ry} 0 0 0 ${ellipse.cx + ellipse.rx} ${ellipse.cy}`}
            />
          );
        })}
        {Array.from({ length: STAKES }, (_, index) => {
          const angle = Math.PI * ((index + 1) / (STAKES + 1));
          const from = {
            x: body.base.cx - Math.cos(angle) * body.base.rx,
            y: body.base.cy + Math.sin(angle) * body.base.ry,
          };
          const to = {
            x: body.top.cx - Math.cos(angle) * body.top.rx,
            y: body.top.cy + Math.sin(angle) * body.top.ry,
          };
          return (
            <line key={index} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />
          );
        })}
      </g>
      <ellipse {...body.top} className="fill-[var(--lm-face-top)]" />
      <ellipse
        {...inner}
        className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
        strokeWidth={0.75}
      />
      {[-1, 1].map((side) => (
        <ellipse
          key={side}
          cx={body.top.cx + side * body.top.rx * 0.82}
          cy={body.top.cy + 6}
          rx={4}
          ry={1.6}
          className="fill-[var(--lm-recess)]"
          strokeWidth={0.75}
        />
      ))}
      <g clipPath={`url(#${clipId})`} strokeWidth={0.75}>
        {renderContents()}
      </g>
      {props.contents === "dirty" && (
        <g
          transform={`translate(${sleeve.x} ${sleeve.y}) scale(${scale})`}
          strokeWidth={0.75}
        >
          <path
            d="M -6 -4 C -7 6 -6 14 -3 22 C -1 24 3 24 5 22 C 4 14 4 6 5 -4 Z"
            className="fill-[var(--lm-face-top)]"
          />
          <path
            d="M -4 18 C -1 19.5 2 19.5 4.6 18 M -2 6 C -1 8 0 9 1 9"
            className="fill-none stroke-[var(--lm-detail)]"
          />
        </g>
      )}
    </g>
  );
}
