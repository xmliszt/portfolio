import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import { getShelfBookId } from "@/lib/laundromat/notebook/get-shelf-book-id";
import type { ShelfBookPlacement } from "@/lib/laundromat/notebook/get-shelf-book-placements";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";

const BOARD_THICKNESS = 0.08;
const BRACKET_DROP = 0.5;

type ShelfDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  highlightedId: string | undefined;
  books: ShelfBookPlacement[];
  details: SceneConfig["details"]["shelf"];
};

export function ShelfDrawing(props: ShelfDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection, details } = props;
  const { unit } = projection;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  const brackets = [p.y + 0.3, p.y + size.d - 0.36];
  return (
    <g className={partStroke(props.highlighted)} strokeLinejoin="round">
      {brackets.map((y) => (
        <g key={y}>
          {[0, 0.05].map((offset) => (
            <polygon
              key={offset}
              className="fill-[var(--lm-face)]"
              points={toSvgPoints([
                at(p.x, y + offset, p.z),
                at(p.x + size.w * 0.75, y + offset, p.z),
                at(p.x, y + offset, p.z - BRACKET_DROP),
              ])}
            />
          ))}
        </g>
      ))}
      <IsoBox
        position={p}
        size={{ w: size.w, d: size.d, h: BOARD_THICKNESS }}
        projection={projection}
      />
      {props.books.map((book) => {
        const isLifted = props.highlightedId === getShelfBookId(book.number);
        const lift = isLifted ? details.bookLift : 0;
        const { x0, x1, y, lean } = book;
        const z0 = book.z0 + lift;
        const z1 = book.z1 + lift;
        const y1 = y + book.thickness;
        const topY = y - lean;
        const front = [
          at(x0, y1, z0),
          at(x1, y1, z0),
          at(x1, topY + book.thickness, z1),
          at(x0, topY + book.thickness, z1),
        ];
        const spine = [
          at(x1, y, z0),
          at(x1, y1, z0),
          at(x1, topY + book.thickness, z1),
          at(x1, topY, z1),
        ];
        const top = [
          at(x0, topY, z1),
          at(x1, topY, z1),
          at(x1, topY + book.thickness, z1),
          at(x0, topY + book.thickness, z1),
        ];
        const spinePlane = getFacePlane({
          plane: "side",
          origin: { x: x1, y: y1, z: z1 },
          projection,
        });
        const spineHeight = (z1 - z0) * unit;
        const spineWidth = book.thickness * unit;
        return (
          <g
            key={book.number}
            className={cn(isLifted && "stroke-[var(--lm-ink-hi)]")}
          >
            <polygon
              className="fill-[var(--lm-face)]"
              points={toSvgPoints(front)}
            />
            <polygon
              className="fill-[var(--lm-wall)]"
              points={toSvgPoints(spine)}
            />
            <polygon
              className="fill-[var(--lm-paper)]"
              fillOpacity={0.14}
              points={toSvgPoints(top)}
            />
            {lean === 0 && (
              <g
                transform={spinePlane.transform}
                className="stroke-[var(--lm-detail)]"
                strokeWidth={0.6}
              >
                <line x1={0.5} y1={4} x2={spineWidth - 0.5} y2={4} />
                <line
                  x1={0.5}
                  y1={spineHeight - 5}
                  x2={spineWidth - 0.5}
                  y2={spineHeight - 5}
                />
                <text
                  x={spineWidth / 2}
                  y={10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.min(4, spineWidth * 0.6)}
                  className={cn(
                    "stroke-none font-[family-name:var(--lm-font-display)] transition-[fill,opacity] duration-200",
                    isLifted
                      ? "fill-[var(--lm-accent-hi)]"
                      : "fill-[var(--lm-ink)]"
                  )}
                  opacity={isLifted ? details.spineGlow : 0.45}
                >
                  {book.number}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
