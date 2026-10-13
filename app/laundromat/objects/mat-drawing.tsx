import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { partStroke } from "./part-stroke";

const BORDER = 0.14;
const FIBER_GAP_PX = 3;
const MAT_LETTER_SPACING_PX = 2;
const MAT_TEXT_WIDTH_RATIO = 0.9;
const WIDE_GLYPH = /[\u1100-\u11ff\u3000-\u9fff\uac00-\ud7af]/;

type MatDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
};

/** Draw the coir welcome mat at the entrance. */
export function MatDrawing(props: MatDrawingProps) {
  const { copy } = useLaundromatCopy();
  const { position: p, size } = props.laidOut.object;
  const { projection } = props;
  const { unit } = projection;
  const faces = getBoxFaces({ position: p, size, projection });
  const top = getFacePlane({
    plane: "top",
    origin: { x: p.x, y: p.y, z: p.z + size.h },
    projection,
  });
  const width = size.w * unit;
  const depth = size.d * unit;
  const border = BORDER * unit;
  const inner = {
    x: border,
    y: border,
    width: width - border * 2,
    height: depth - border * 2,
  };
  const glyphCount = [
    ...new Intl.Segmenter(copy.locale, { granularity: "grapheme" }).segment(
      copy.matWelcome
    ),
  ].length;
  const glyphWidthEm = WIDE_GLYPH.test(copy.matWelcome) ? 1 : 0.6;
  const fittedFontSize =
    ((inner.width * MAT_TEXT_WIDTH_RATIO) / glyphCount -
      MAT_LETTER_SPACING_PX) /
    glyphWidthEm;
  const fibers = Array.from(
    { length: Math.floor(inner.width / FIBER_GAP_PX) },
    (_, index) => inner.x + FIBER_GAP_PX * (index + 0.5)
  );
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(faces.front)}
      />
      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(faces.side)}
      />
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(faces.top)}
      />
      <g transform={top.transform}>
        <rect
          {...inner}
          rx={2}
          className="fill-[var(--lm-face-top)] stroke-[var(--lm-detail)]"
          strokeWidth={0.75}
        />
        <g className="stroke-[var(--lm-detail)]" strokeWidth={0.5}>
          {fibers.map((x) => (
            <line
              key={x}
              x1={x}
              y1={inner.y + 2}
              x2={x}
              y2={inner.y + inner.height - 2}
              strokeOpacity={0.5}
            />
          ))}
        </g>
        <text
          x={width / 2}
          y={depth / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.min(11, inner.height * 0.42, fittedFontSize)}
          letterSpacing={MAT_LETTER_SPACING_PX}
          className="fill-[var(--lm-ink)] stroke-none font-[family-name:var(--lm-font-display)] lowercase"
        >
          {copy.matWelcome}
        </text>
      </g>
    </g>
  );
}
