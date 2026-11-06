import { cn } from "@/lib/utils";

type TranslateGlyphProps = {
  className: string;
};

/** Draw the translate mark, a character beside a letter A, in the current text color. */
export function TranslateGlyph(props: TranslateGlyphProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 14 14"
      className={cn("shrink-0 fill-none stroke-current", props.className)}
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 3h6M4.5 1.5V3M3 3c.3 2.2 1.6 3.8 3.5 4.6M6 3c-.4 2.3-2 4-4.2 4.8M7.5 12.5l2.5-6 2.5 6M8.3 10.6h3.4" />
    </svg>
  );
}
