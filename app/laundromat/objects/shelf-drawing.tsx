import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import type { SceneConfig } from "@/lib/laundromat/scene-config";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { IsoBox } from "./iso-box";
import { partStroke } from "./part-stroke";

const BOARD_THICKNESS = 0.08;
const BRACKET_DROP = 0.5;
const BOOKS = [
  { thickness: 0.16, height: 1.18, depth: 0.58 },
  { thickness: 0.19, height: 1.3, depth: 0.62 },
  { thickness: 0.14, height: 1.06, depth: 0.54 },
  { thickness: 0.18, height: 1.24, depth: 0.6 },
  { thickness: 0.15, height: 1.36, depth: 0.62 },
  { thickness: 0.2, height: 1.12, depth: 0.56 },
  { thickness: 0.16, height: 1.28, depth: 0.6 },
  { thickness: 0.17, height: 1.2, depth: 0.58 },
  { thickness: 0.15, height: 1.1, depth: 0.56 },
];

type ShelfDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
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
  const boardTop = p.z + BOARD_THICKNESS;
  const books = BOOKS.reduce<
    { y: number; book: (typeof BOOKS)[number]; lean: number }[]
  >((placed, book, index) => {
    const previous = placed.at(-1);
    const y =
      previous === undefined
        ? p.y + 0.14
        : previous.y + previous.book.thickness + 0.01;
    const lean = index === BOOKS.length - 1 ? details.bookLean : 0;
    return [...placed, { y: y + lean, book, lean }];
  }, []);
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
      {books.map(({ y, book, lean }) => {
        const x0 = p.x + 0.06;
        const x1 = x0 + book.depth;
        const y1 = y + book.thickness;
        const z1 = boardTop + Math.min(book.height, size.h - BOARD_THICKNESS);
        const topY = y - lean;
        const front = [
          at(x0, y1, boardTop),
          at(x1, y1, boardTop),
          at(x1, topY + book.thickness, z1),
          at(x0, topY + book.thickness, z1),
        ];
        const spine = [
          at(x1, y, boardTop),
          at(x1, y1, boardTop),
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
          origin: { x: x1, y: y1, z: boardTop + (z1 - boardTop) },
          projection,
        });
        const spineHeight = (z1 - boardTop) * unit;
        const spineWidth = book.thickness * unit;
        return (
          <g key={y}>
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
                <circle
                  cx={spineWidth / 2}
                  cy={9}
                  r={0.9}
                  className="fill-[var(--lm-accent-hi)] stroke-none"
                  opacity={props.highlighted ? details.spineGlow : 0}
                />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}
