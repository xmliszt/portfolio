import Image from "next/image";

import { getCoverHue } from "@/lib/laundromat/bookshelf/get-cover-hue";
import { cn } from "@/lib/utils";

import type { ShelfBookView } from "./bookshelf-actions";

type BookCoverProps = {
  book: Pick<ShelfBookView, "title" | "authors" | "coverUrl" | "source">;
  widthPx: number;
};

export function BookCover(props: BookCoverProps) {
  const { book } = props;
  const heightPx = Math.round(props.widthPx * 1.5);
  if (book.coverUrl !== undefined) {
    return (
      <Image
        src={book.coverUrl}
        alt=""
        width={props.widthPx}
        height={heightPx}
        className="shrink-0 rounded-[2px_4px_4px_2px] bg-[var(--lm-face)] object-cover shadow-[inset_0_0_0_1px_var(--lm-edge)]"
        style={{ width: props.widthPx, height: heightPx }}
      />
    );
  }
  const hue = getCoverHue(`${book.title}${book.authors}`);
  const isManual = book.source === "manual";
  return (
    <div
      aria-hidden
      className={cn(
        "[container-type:inline-size] relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[2px_4px_4px_2px] p-[9%]",
        isManual
          ? "bg-[var(--lm-face)] text-[var(--lm-ink-hi)] shadow-[inset_0_0_0_1px_var(--lm-edge)]"
          : "text-[#f3ede2] shadow-[inset_3px_0_0_rgb(0_0_0/0.15)]"
      )}
      style={{
        width: props.widthPx,
        height: heightPx,
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
        {book.title}
      </span>
      {!isManual && (
        <i
          className="absolute top-[55%] right-0 left-0 h-[13cqi]"
          style={{ background: `hsl(${(hue + 30) % 360} 50% 58%)` }}
        />
      )}
      <span className="relative z-[1] font-[family-name:var(--lm-font-mono)] text-[6.5cqi] opacity-85">
        {book.authors}
      </span>
    </div>
  );
}
