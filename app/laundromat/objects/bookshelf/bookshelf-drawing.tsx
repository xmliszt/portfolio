import { BoxBevel } from "@/app/laundromat/objects/box-bevel";
import { partStroke } from "@/app/laundromat/objects/part-stroke";
import type { BookshelfView } from "@/app/laundromat/objects/scene-views";
import { BOOKSHELF_GEOMETRY as G } from "@/lib/laundromat/bookshelf/bookshelf-geometry";
import type { BookshelfRowKey } from "@/lib/laundromat/bookshelf/bookshelf-row";
import { getBookshelfBookOutline } from "@/lib/laundromat/bookshelf/get-bookshelf-book-outline";
import { getBookshelfBookPlacements } from "@/lib/laundromat/bookshelf/get-bookshelf-book-placements";
import { getBookshelfRows } from "@/lib/laundromat/bookshelf/get-bookshelf-rows";
import type { LaidOutObject } from "@/lib/laundromat/build-scene-layout";
import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { BookshelfLabelHolder } from "./bookshelf-label-holder";
import { BookshelfLiftedBook } from "./bookshelf-lifted-book";
import { BookshelfRowBooks } from "./bookshelf-row-books";
import { ShadedBox } from "./shaded-box";

const COS_30 = Math.cos(Math.PI / 6);
const SIN_30 = Math.sin(Math.PI / 6);
const PLANKS = 7;
const PIN_STEP = 0.13;

type BookshelfDrawingProps = {
  laidOut: LaidOutObject;
  projection: IsoProjection;
  highlighted: boolean;
  view: BookshelfView;
};

export function BookshelfDrawing(props: BookshelfDrawingProps) {
  const { position: p, size } = props.laidOut.object;
  const { projection, view } = props;
  const { unit } = projection;
  const rows = getBookshelfRows({ position: p, size });
  const body = size.d - G.overhang;
  const top = rows.top;
  const inner = { x0: p.x + G.side, x1: p.x + size.w - G.side };
  const pullPx = { x: -COS_30 * G.pull * unit, y: SIN_30 * G.pull * unit };
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  function line(
    a: [number, number, number],
    b: [number, number, number],
    width: number
  ) {
    const from = at(...a);
    const to = at(...b);
    return (
      <line
        key={`${a.join()}-${b.join()}`}
        className="stroke-[var(--lm-detail)]"
        strokeWidth={width}
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
      />
    );
  }
  function board(z: number) {
    return (
      <g>
        <ShadedBox
          position={{ x: inner.x0, y: p.y + G.back, z }}
          size={{ w: inner.x1 - inner.x0, d: body - G.back, h: G.board }}
          projection={projection}
          side="var(--lm-shade-2)"
        />
        {line(
          [inner.x0, p.y + body, z + G.board / 2],
          [inner.x1, p.y + body, z + G.board / 2],
          0.45
        )}
      </g>
    );
  }
  function rowBooks(key: BookshelfRowKey) {
    const row = rows[key];
    const rowView = view.rows[key];
    return (
      <BookshelfRowBooks
        row={row}
        spines={rowView.spines}
        direction={rowView.direction}
        pulledBookId={view.pulled?.row === key ? view.pulled.bookId : undefined}
        pullPx={pullPx}
        projection={projection}
        openingLeftX={inner.x0}
        openingRightX={inner.x1}
      />
    );
  }
  function labelHolder(key: BookshelfRowKey) {
    const rowView = view.rows[key];
    return (
      <BookshelfLabelHolder
        row={rows[key]}
        position={p}
        size={size}
        text={rowView.label}
        hasPrevious={rowView.page > 0}
        hasNext={rowView.page < rowView.pageCount - 1}
        projection={projection}
      />
    );
  }
  const lifted = (() => {
    if (view.pulled === undefined) return undefined;
    const { row: key, bookId } = view.pulled;
    const spines = view.rows[key].spines;
    const index = spines.findIndex((spine) => spine.id === bookId);
    const book = getBookshelfBookPlacements({
      row: rows[key],
      bookIds: spines.map((spine) => spine.id),
    }).at(index);
    if (index === -1 || book === undefined) return undefined;
    return { book, spine: spines[index] };
  })();
  const liftClipId = `bookshelf-lift-${props.laidOut.object.id}`;
  const pinRows = [p.y + 0.32, p.y + body - 0.3];
  const pinZs = Array.from(
    { length: Math.floor((top - p.z - G.kick - 0.22) / PIN_STEP) },
    (_, i) => p.z + G.kick + 0.16 + i * PIN_STEP
  );
  const slabFaces = getBoxFaces({
    position: { x: p.x - G.overhang, y: p.y, z: top },
    size: { w: size.w + 2 * G.overhang, d: size.d, h: G.slab },
    projection,
  });
  const endInset = 0.08;
  return (
    <g
      className={partStroke(props.highlighted)}
      strokeWidth={0.75}
      strokeLinejoin="round"
    >
      <ShadedBox
        position={{ x: p.x + G.kickInset, y: p.y + 0.02, z: p.z }}
        size={{ w: size.w - 2 * G.kickInset, d: body - 0.2, h: G.kick }}
        projection={projection}
        front="var(--lm-wall)"
        top="var(--lm-recess)"
      />
      <polygon
        className="fill-[var(--lm-recess)]"
        points={toSvgPoints([
          at(inner.x0, p.y + G.back, p.z + G.kick),
          at(inner.x1, p.y + G.back, p.z + G.kick),
          at(inner.x1, p.y + G.back, top),
          at(inner.x0, p.y + G.back, top),
        ])}
      />
      {Array.from({ length: PLANKS - 1 }, (_, i) => {
        const x = inner.x0 + ((inner.x1 - inner.x0) * (i + 1)) / PLANKS;
        return line(
          [x, p.y + G.back, p.z + G.kick],
          [x, p.y + G.back, top],
          0.55
        );
      })}
      <ShadedBox
        position={{ x: p.x, y: p.y, z: p.z + G.kick }}
        size={{ w: G.side, d: body, h: top - p.z - G.kick }}
        projection={projection}
        side="var(--lm-shade-1)"
      />
      {pinRows.flatMap((y) =>
        pinZs.map((z) => {
          const pin = at(inner.x0, y, z);
          return (
            <circle
              key={`${y}-${z}`}
              cx={pin.x}
              cy={pin.y}
              r={0.0095 * unit}
              className="fill-[var(--lm-recess)] stroke-[var(--lm-detail)]"
              strokeWidth={0.4}
            />
          );
        })
      )}
      {line(
        [p.x + G.side / 2, p.y + body, p.z + G.kick],
        [p.x + G.side / 2, p.y + body, top],
        0.45
      )}
      {board(p.z + G.kick)}
      {rowBooks("fresh")}
      {board(rows.middleZ)}
      {labelHolder("fresh")}
      {labelHolder("loved")}
      {rowBooks("loved")}
      <ShadedBox
        position={{ x: inner.x0, y: p.y + body - 0.05, z: rows.loved.ceilingZ }}
        size={{ w: inner.x1 - inner.x0, d: 0.05, h: top - rows.loved.ceilingZ }}
        projection={projection}
        side="var(--lm-shade-2)"
      />
      <ShadedBox
        position={{ x: p.x + size.w - G.side, y: p.y, z: p.z + G.kick }}
        size={{ w: G.side, d: body, h: top - p.z - G.kick }}
        projection={projection}
      />
      {line(
        [p.x + size.w - G.side / 2, p.y + body, p.z + G.kick],
        [p.x + size.w - G.side / 2, p.y + body, top],
        0.45
      )}
      <polygon
        className="fill-none stroke-[var(--lm-detail)]"
        strokeWidth={0.55}
        points={toSvgPoints([
          at(p.x + size.w, p.y + endInset, p.z + G.kick + endInset),
          at(p.x + size.w, p.y + body - endInset, p.z + G.kick + endInset),
          at(p.x + size.w, p.y + body - endInset, top - endInset),
          at(p.x + size.w, p.y + endInset, top - endInset),
        ])}
      />
      {[
        p.z + G.kick + G.board / 2,
        rows.middleZ + G.board / 2,
        rows.loved.ceilingZ + 0.05,
      ].flatMap((z) =>
        [p.y + 0.22, p.y + body - 0.22].map((y) => {
          const cap = at(p.x + size.w, y, z);
          return (
            <ellipse
              key={`${y}-${z}`}
              cx={cap.x}
              cy={cap.y}
              rx={0.015 * unit}
              ry={0.019 * unit}
              className="fill-[var(--lm-face-top)]"
              strokeWidth={0.5}
            />
          );
        })
      )}
      <polygon
        className="fill-[var(--lm-face-top)]"
        points={toSvgPoints(slabFaces.top)}
      />
      <polygon
        className="fill-[var(--lm-wall)]"
        points={toSvgPoints(slabFaces.side)}
      />
      <polygon
        className="fill-[var(--lm-face)]"
        points={toSvgPoints(slabFaces.front)}
      />
      <BoxBevel points={slabFaces.bevel} />
      {line(
        [p.x - G.overhang, p.y + size.d, top + 0.035],
        [p.x + size.w + G.overhang, p.y + size.d, top + 0.035],
        0.45
      )}
      {line(
        [p.x + size.w + G.overhang, p.y + size.d, top + 0.035],
        [p.x + size.w + G.overhang, p.y, top + 0.035],
        0.45
      )}
      {lifted !== undefined && (
        <g pointerEvents="none">
          <defs>
            <clipPath id={liftClipId}>
              <polygon
                points={toSvgPoints(
                  getBookshelfBookOutline({
                    book: lifted.book,
                    projection,
                    fromY: Math.min(
                      lifted.book.frontY,
                      p.y + body + 0.03 - G.pull
                    ),
                  }).outline
                )}
              />
            </clipPath>
          </defs>
          <BookshelfLiftedBook
            key={`${view.pulled?.row}-${lifted.book.id}`}
            book={lifted.book}
            title={lifted.spine.title}
            manual={lifted.spine.manual}
            pullPx={pullPx}
            projection={projection}
            clipPathId={liftClipId}
          />
        </g>
      )}
    </g>
  );
}
