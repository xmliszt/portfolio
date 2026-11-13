import type { BookshelfBookPlacement } from "@/lib/laundromat/bookshelf/get-bookshelf-book-placements";
import { WIDE_GLYPH_PATTERN } from "@/lib/laundromat/bookshelf/wide-glyph-pattern";
import { getFacePlane } from "@/lib/laundromat/get-face-plane";
import type { IsoProjection } from "@/lib/laundromat/project-iso-point";
import { projectIsoPoint } from "@/lib/laundromat/project-iso-point";
import { toSvgPoints } from "@/lib/laundromat/to-svg-points";
import { cn } from "@/lib/utils";

const SPINE_TONES = [
  "--lm-face",
  "--lm-shade-2",
  "--lm-shade-1",
  "--lm-wall",
  "--lm-face-top",
] as const;
const CJK = /[぀-ヿ㐀-鿿가-힯]/;

type BookshelfBookProps = {
  book: BookshelfBookPlacement;
  title: string;
  manual: boolean;
  pulled: boolean;
  offsetPx: { x: number; y: number };
  projection: IsoProjection;
};

export function BookshelfBook(props: BookshelfBookProps) {
  const { book, projection } = props;
  const unit = projection.unit;
  const k = unit / 100;
  function at(x: number, y: number, z: number) {
    return projectIsoPoint({ point: { x, y, z }, projection });
  }
  function tint(token: string) {
    return props.manual
      ? `var(${token})`
      : `color-mix(in oklab, var(${token}) 90%, hsl(${book.hue} 40% 50%))`;
  }
  const { x0, x1, backY, frontY, z0, z1 } = book;
  const tone = SPINE_TONES[book.toneIndex % SPINE_TONES.length];
  const coverSide = SPINE_TONES[(book.toneIndex + 1) % SPINE_TONES.length];
  const board = book.isHardcover ? 0.016 : 0.006;
  const square = book.isHardcover ? 0.02 : 0;
  const width = (x1 - x0) * unit;
  const height = (z1 - z0) * unit;
  const fontSize = Math.min(width * 0.46, 9.5 * k);
  const isCjk = WIDE_GLYPH_PATTERN.test(props.title);
  const maxChars = Math.max(
    3,
    Math.floor((height - 26 * k) / (fontSize * (isCjk ? 1.04 : 0.6)))
  );
  const chars = [...props.title];
  const title =
    chars.length > maxChars
      ? `${chars.slice(0, maxChars - 1).join("")}…`
      : props.title;
  const spine = getFacePlane({
    plane: "front",
    origin: { x: x0, y: frontY, z: z1 },
    projection,
  });
  const middleX = (x0 + x1) / 2;
  return (
    <g
      data-lm-motion
      className={cn(props.pulled && "stroke-[var(--lm-ink-hi)]")}
      transform={`translate(${props.offsetPx.x} ${props.offsetPx.y})`}
      style={{ transition: "stroke 200ms" }}
    >
      <g data-book-swap>
        <polygon
          fill={tint("--lm-face-top")}
          points={toSvgPoints([
            at(x0, backY, z1),
            at(x1, backY, z1),
            at(x1, frontY, z1),
            at(x0, frontY, z1),
          ])}
        />
        <polygon
          className="fill-[var(--lm-paper)] stroke-[var(--lm-detail)]"
          fillOpacity={0.16}
          strokeWidth={0.4}
          points={toSvgPoints([
            at(x0 + board, backY + square, z1),
            at(x1 - board, backY + square, z1),
            at(x1 - board, frontY - 0.035, z1),
            at(x0 + board, frontY - 0.035, z1),
          ])}
        />
        <line
          className="stroke-[var(--lm-detail)]"
          strokeWidth={0.3}
          x1={at(middleX, backY + square, z1).x}
          y1={at(middleX, backY + square, z1).y}
          x2={at(middleX, frontY - 0.035, z1).x}
          y2={at(middleX, frontY - 0.035, z1).y}
        />
        <polygon
          fill={tint(coverSide)}
          points={toSvgPoints([
            at(x1, backY, z0),
            at(x1, frontY, z0),
            at(x1, frontY, z1),
            at(x1, backY, z1),
          ])}
        />
        {book.isHardcover && (
          <line
            className="stroke-[var(--lm-detail)]"
            strokeWidth={0.45}
            x1={at(x1, frontY - 0.05, z0).x}
            y1={at(x1, frontY - 0.05, z0).y}
            x2={at(x1, frontY - 0.05, z1).x}
            y2={at(x1, frontY - 0.05, z1).y}
          />
        )}
        <polygon
          fill={tint(tone)}
          points={toSvgPoints([
            at(x0, frontY, z0),
            at(x1, frontY, z0),
            at(x1, frontY, z1),
            at(x0, frontY, z1),
          ])}
        />
        <g
          transform={spine.transform}
          className="stroke-[var(--lm-detail)]"
          strokeWidth={0.5}
        >
          {(book.isHardcover
            ? [6, 8.4, height / k - 9.4, height / k - 7]
            : [height / k - 11]
          ).map((y) => (
            <line key={y} x1={0} y1={y * k} x2={width} y2={y * k} />
          ))}
          {book.isHardcover ? (
            <circle
              cx={width / 2}
              cy={height - 4 * k}
              r={k}
              className="fill-[var(--lm-detail)] stroke-none"
            />
          ) : (
            <rect
              x={width / 2 - 1.6 * k}
              y={height - 7.4 * k}
              width={3.2 * k}
              height={3.2 * k}
              className="fill-none"
              strokeWidth={0.45}
            />
          )}
          <text
            x={width / 2}
            y={(height - (book.isHardcover ? 4 : 10) * k) / 2 + 2 * k}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={fontSize}
            className={cn(
              "stroke-none transition-[fill,opacity] duration-200 [writing-mode:vertical-rl]",
              props.manual
                ? "font-[family-name:var(--lm-font-mono)]"
                : "font-[family-name:var(--lm-font-display)]",
              props.pulled
                ? "fill-[var(--lm-accent-hi)]"
                : "fill-[var(--lm-ink)]"
            )}
            opacity={props.pulled ? 1 : 0.8}
          >
            {title}
          </text>
        </g>
      </g>
    </g>
  );
}
