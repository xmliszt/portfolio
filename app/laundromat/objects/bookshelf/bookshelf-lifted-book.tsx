"use client";

import { useEffect, useState } from "react";

import type { BookshelfBookPlacement } from "@/lib/laundromat/bookshelf/get-bookshelf-book-placements";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";

import { BookshelfBook } from "./bookshelf-book";

type BookshelfLiftedBookProps = {
  book: BookshelfBookPlacement;
  title: string;
  manual: boolean;
  pullPx: { x: number; y: number };
  projection: IsoProjection;
  clipPathId: string;
};

export function BookshelfLiftedBook(props: BookshelfLiftedBookProps) {
  const [pulled, setPulled] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setPulled(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return <BookshelfBook {...props} pulled={pulled} />;
}
