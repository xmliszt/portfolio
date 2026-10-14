import type { BoardEntry } from "@/lib/laundromat/board/parse-board-entries";
import type { LaundromatCopy } from "@/lib/laundromat/i18n/laundromat-copy";
import { fitCaptionFontSize } from "@/lib/laundromat/tv/fit-caption-font-size";

export const BOARD_POSTER_SIZE = { width: 100, height: 148 };

const PAD = 9;
const META_TEXT = 3.6;
const TITLE_TEXT = 6.4;
const HEADER_RULE_Y = 40;
const ROW_HEIGHT = 25;
const FOOTER_RULE_Y = BOARD_POSTER_SIZE.height - 15;
const TEXT_WIDTH = BOARD_POSTER_SIZE.width - 2 * PAD;
const INK = "fill-[var(--lm-ink-pen)] stroke-none";
const MONO = `${INK} font-[family-name:var(--lm-font-mono)] lowercase`;
const SERIF = `${INK} font-[family-name:var(--lm-font-display)] lowercase`;

type BoardPosterProps = {
  copy: LaundromatCopy;
  entries: BoardEntry[];
};

/** Draw the board's page in a `BOARD_POSTER_SIZE` box: eyebrow, heading, latest `updated` date, one row per entry with date, tag and title, and the footer. */
export function BoardPoster(props: BoardPosterProps) {
  const { width, height } = BOARD_POSTER_SIZE;
  const titleFontSize = Math.min(
    TITLE_TEXT,
    ...props.entries.map((entry) =>
      fitCaptionFontSize({
        text: entry.title,
        maxWidth: TEXT_WIDTH,
        maxFontSize: TITLE_TEXT,
      })
    )
  );
  const latestDate = props.entries.at(0)?.date;
  return (
    <g>
      <rect width={width} height={height} className="fill-[var(--lm-paper)]" />
      <text
        x={PAD}
        y={PAD + 3}
        fontSize={META_TEXT}
        className={MONO}
        opacity={0.6}
      >
        {props.copy.board.eyebrow}
      </text>
      <text
        x={PAD}
        y={PAD + 18}
        fontSize={fitCaptionFontSize({
          text: props.copy.board.heading,
          maxWidth: TEXT_WIDTH,
          maxFontSize: 14,
        })}
        className={SERIF}
        data-board-heading
      >
        {props.copy.board.heading}
      </text>
      {latestDate !== undefined && (
        <text
          x={PAD}
          y={PAD + 26}
          fontSize={META_TEXT}
          className={MONO}
          opacity={0.6}
        >
          {props.copy.board.updated({ date: latestDate })}
        </text>
      )}
      <rect
        x={PAD}
        y={HEADER_RULE_Y}
        width={TEXT_WIDTH}
        height={0.8}
        className={INK}
      />
      {props.entries.map((entry, index) => {
        const top = HEADER_RULE_Y + index * ROW_HEIGHT;
        const tagWidth = entry.tag.length * META_TEXT * 0.62 + 3;
        return (
          <g key={entry.id} data-board-update={entry.id}>
            <text
              x={PAD}
              y={top + 9.5}
              fontSize={META_TEXT}
              className={MONO}
              opacity={0.6}
            >
              {entry.date}
            </text>
            <rect
              x={width - PAD - tagWidth}
              y={top + 6}
              width={tagWidth}
              height={5}
              rx={2.5}
              className="fill-none stroke-[var(--lm-ink-pen)]"
              strokeWidth={0.3}
              opacity={0.5}
            />
            <text
              x={width - PAD - tagWidth / 2}
              y={top + 9.6}
              fontSize={META_TEXT * 0.8}
              textAnchor="middle"
              className={MONO}
            >
              {entry.tag}
            </text>
            <text
              x={PAD}
              y={top + 19}
              fontSize={titleFontSize}
              className={SERIF}
            >
              {entry.title}
            </text>
            {index < props.entries.length - 1 && (
              <rect
                x={PAD}
                y={top + ROW_HEIGHT - 0.15}
                width={TEXT_WIDTH}
                height={0.3}
                className={INK}
                opacity={0.18}
              />
            )}
          </g>
        );
      })}
      <rect
        x={PAD}
        y={FOOTER_RULE_Y}
        width={TEXT_WIDTH}
        height={0.3}
        className={INK}
        opacity={0.18}
      />
      <text
        x={PAD}
        y={FOOTER_RULE_Y + 8}
        fontSize={META_TEXT}
        className={MONO}
        opacity={0.6}
      >
        {props.copy.board.footer}
      </text>
    </g>
  );
}
