import { getTicketChecksum } from "@/lib/laundromat/settings-ticket/get-ticket-checksum";
import { tipCopy } from "@/lib/laundromat/tip/tip-copy";

const MODULES = 25;
const FINDER = 7;
const MODULE_PX = 6;

function isFinder(options: { row: number; column: number }) {
  const { row, column } = options;
  return [
    [0, 0],
    [0, MODULES - FINDER],
    [MODULES - FINDER, 0],
  ].some(
    ([top, left]) =>
      row >= top &&
      row < top + FINDER &&
      column >= left &&
      column < left + FINDER
  );
}

function isFinderDark(options: { row: number; column: number }) {
  const r = options.row % (MODULES - FINDER);
  const c = options.column % (MODULES - FINDER);
  const ring = Math.min(r, c, FINDER - 1 - r, FINDER - 1 - c);
  return ring !== 1;
}

type FakePayNowCodeProps = { seed: string };

/** Draw a QR-like PayNow placeholder whose pattern comes from `seed`; it scans as nothing. */
export function FakePayNowCode(props: FakePayNowCodeProps) {
  const cells = Array.from({ length: MODULES * MODULES }, (_, index) => {
    const row = Math.floor(index / MODULES);
    const column = index % MODULES;
    const isDark = isFinder({ row, column })
      ? isFinderDark({ row, column })
      : Number.parseInt(
          getTicketChecksum(`${props.seed}:${index}`).at(0) ?? "0",
          16
        ) < 7;
    return { row, column, isDark };
  });
  const sizePx = MODULES * MODULE_PX;
  return (
    <svg
      role="img"
      aria-label={tipCopy.payNowLabel}
      viewBox={`-8 -8 ${sizePx + 16} ${sizePx + 16}`}
      className="size-44 rounded-md bg-[#fff]"
    >
      {cells
        .filter(({ isDark }) => isDark)
        .map(({ row, column }) => (
          <rect
            key={`${row}-${column}`}
            x={column * MODULE_PX}
            y={row * MODULE_PX}
            width={MODULE_PX}
            height={MODULE_PX}
            fill="#7c1a78"
          />
        ))}
    </svg>
  );
}
