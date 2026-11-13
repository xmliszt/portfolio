"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import type { BookshelfSpine } from "@/app/laundromat/objects/scene-views";
import { useRenderQuality } from "@/app/laundromat/settings/use-render-quality";
import type { BookshelfRow } from "@/lib/laundromat/bookshelf/bookshelf-row";
import { getBookshelfBookPlacements } from "@/lib/laundromat/bookshelf/get-bookshelf-book-placements";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";

import { BookshelfBook } from "./bookshelf-book";
import { BookshelfBookend } from "./bookshelf-bookend";

const EXIT_MS = 210;
const ENTER_MS = 340;
const EXIT_STAGGER_MS = 22;
const ENTER_STAGGER_MS = 28;
const FADE_MS = 140;

type BookshelfRowBooksProps = {
  row: BookshelfRow;
  spines: BookshelfSpine[];
  direction: 1 | -1;
  pulledBookId: number | undefined;
  pullProgress: { [key: string]: number };
  pullPx: { x: number; y: number };
  projection: IsoProjection;
  openingLeftX: number;
  openingRightX: number;
};

function toKey(spines: BookshelfSpine[]) {
  return spines.map((spine) => spine.id).join(",");
}

export function BookshelfRowBooks(props: BookshelfRowBooksProps) {
  const { row, projection } = props;
  const clipId = useId();
  const groupRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();
  const { quality } = useRenderQuality();
  const isCalm = reducedMotion === true || quality === "lite";
  const [shown, setShown] = useState(props.spines);
  const [isSwapping, setIsSwapping] = useState(false);
  const enterPendingRef = useRef(false);
  const incomingKey = toKey(props.spines);
  const shownKey = toKey(shown);

  useEffect(() => {
    if (incomingKey === shownKey) return;
    const group = groupRef.current;
    if (group === null) {
      setShown(props.spines);
      return;
    }
    let cancelled = false;
    const books = [...group.querySelectorAll<SVGGElement>("[data-book-swap]")];
    const ordered = props.direction > 0 ? books : books.toReversed();
    setIsSwapping(true);
    const exits = isCalm
      ? [
          group.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: FADE_MS,
            fill: "forwards",
          }),
        ]
      : ordered.map((book, index) =>
          book.animate(
            [
              { transform: "translateY(0)", opacity: 1 },
              {
                transform: `translateY(${-0.38 * projection.unit}px)`,
                opacity: 0,
              },
            ],
            {
              duration: EXIT_MS,
              delay: index * EXIT_STAGGER_MS,
              easing: "cubic-bezier(.5,0,.9,.4)",
              fill: "forwards",
            }
          )
        );
    Promise.all(exits.map((animation) => animation.finished))
      .catch(() => undefined)
      .then(() => {
        if (cancelled) return;
        enterPendingRef.current = true;
        setShown(props.spines);
      });
    return () => {
      cancelled = true;
      for (const animation of exits) animation.cancel();
    };
  }, [
    incomingKey,
    shownKey,
    props.spines,
    props.direction,
    isCalm,
    projection.unit,
  ]);

  useLayoutEffect(() => {
    if (!enterPendingRef.current) return;
    enterPendingRef.current = false;
    const group = groupRef.current;
    if (group === null) return;
    for (const animation of group.getAnimations({ subtree: true })) {
      animation.cancel();
    }
    const books = [...group.querySelectorAll<SVGGElement>("[data-book-swap]")];
    const ordered = props.direction > 0 ? books : books.toReversed();
    const enters = isCalm
      ? [
          group.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: FADE_MS,
            fill: "backwards",
          }),
        ]
      : ordered.map((book, index) =>
          book.animate(
            [
              {
                transform: `translateY(${-0.46 * projection.unit}px)`,
                opacity: 0,
              },
              { transform: "translateY(0)", opacity: 1 },
            ],
            {
              duration: ENTER_MS,
              delay: 40 + index * ENTER_STAGGER_MS,
              easing: "cubic-bezier(.2,.9,.3,1.12)",
              fill: "backwards",
            }
          )
        );
    Promise.all(enters.map((animation) => animation.finished))
      .catch(() => undefined)
      .then(() => setIsSwapping(false));
  }, [shownKey, props.direction, isCalm, projection.unit]);

  const placements = getBookshelfBookPlacements({
    row,
    bookIds: shown.map((spine) => spine.id),
  });
  const endX = (placements.at(-1)?.x1 ?? row.x0) + 0.012;
  const opening = [
    { x: props.openingLeftX, z: row.floorZ },
    { x: props.openingRightX, z: row.floorZ },
    { x: props.openingRightX, z: row.ceilingZ },
    { x: props.openingLeftX, z: row.ceilingZ },
  ].map(({ x, z }) =>
    projectIsoPoint({ point: { x, y: row.frontY, z }, projection })
  );
  return (
    <g>
      <defs>
        <clipPath id={clipId}>
          <polygon points={toSvgPoints(opening)} />
        </clipPath>
      </defs>
      <BookshelfBookend
        row={row}
        x={endX}
        part="base"
        projection={projection}
      />
      <g ref={groupRef} clipPath={isSwapping ? `url(#${clipId})` : undefined}>
        {placements.map((book, index) => {
          const progress = isSwapping
            ? 0
            : (props.pullProgress[`${row.key}:${book.id}`] ?? 0);
          return (
            <BookshelfBook
              key={book.id}
              book={book}
              title={shown[index].title}
              manual={shown[index].manual}
              pulled={!isSwapping && props.pulledBookId === book.id}
              offsetPx={{
                x: props.pullPx.x * progress,
                y: props.pullPx.y * progress,
              }}
              projection={projection}
            />
          );
        })}
      </g>
      <BookshelfBookend
        row={row}
        x={endX}
        part="upright"
        projection={projection}
      />
    </g>
  );
}
