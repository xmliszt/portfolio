"use client";

import { useState } from "react";
import Image from "next/image";

import { getCoverHue } from "@/lib/laundromat/bookshelf/get-cover-hue";
import { cn } from "@/lib/utils";

import type { ShelfBookView } from "./bookshelf-actions";

const COVER_PADDING_RATIO = 0.09;

type BookCoverProps = {
  book: Pick<ShelfBookView, "title" | "authors" | "coverUrl" | "source">;
  widthPx: number;
};

export function BookCover(props: BookCoverProps) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const heightPx = Math.round(props.widthPx * 1.5);
  if (props.book.coverUrl !== undefined && props.book.coverUrl !== failedUrl) {
    const coverUrl = props.book.coverUrl;
    return (
      <Image
        src={coverUrl}
        onError={() => setFailedUrl(coverUrl)}
        alt=""
        width={props.widthPx}
        height={heightPx}
        className="shrink-0 rounded-[2px_4px_4px_2px] bg-[var(--lm-face)] object-cover shadow-[inset_0_0_0_1px_var(--lm-edge)]"
        style={{ width: props.widthPx, height: heightPx }}
      />
    );
  }
  const hue = getCoverHue(`${props.book.title}${props.book.authors}`);
  const isManual = props.book.source === "manual";
  return (
    <div
      aria-hidden
      className={cn(
        "[container-type:inline-size] relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[2px_4px_4px_2px]",
        isManual
          ? "bg-[var(--lm-face)] text-[var(--lm-ink-hi)] shadow-[inset_0_0_0_1px_var(--lm-edge)]"
          : "text-[#f3ede2] shadow-[inset_3px_0_0_rgb(0_0_0/0.15)]"
      )}
      style={{
        width: props.widthPx,
        height: heightPx,
        padding: props.widthPx * COVER_PADDING_RATIO,
        background: isManual ? undefined : `hsl(${hue} 30% 30%)`,
      }}
    >
      <span
        className={cn(
          "relative z-[1] leading-[1.15] [overflow-wrap:anywhere]",
          isManual
            ? "font-[family-name:var(--lm-font-mono)] text-[12cqi]"
            : "font-[family-name:var(--lm-font-display)] text-[12.5cqi]"
        )}
      >
        {props.book.title}
      </span>
      {!isManual && (
        <i
          className="absolute top-[55%] right-0 left-0 h-[13cqi]"
          style={{ background: `hsl(${(hue + 30) % 360} 50% 58%)` }}
        />
      )}
      <span className="relative z-[1] font-[family-name:var(--lm-font-mono)] text-[6.5cqi] opacity-85">
        {props.book.authors}
      </span>
    </div>
  );
}
