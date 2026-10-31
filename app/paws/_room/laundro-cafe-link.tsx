import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────
 * LAUNDRO.CAFE MARK
 *
 *   always       three steam wisps rise and fade, 0.8s apart
 *   always       the coffee in the porthole turns once in 6s
 *   on hover     the drum speeds up to a spin cycle, 0.9s a turn
 * ───────────────────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes pw-steam {
  0% { transform: translateY(2px); opacity: 0; }
  35% { opacity: 1; }
  100% { transform: translateY(-3px); opacity: 0; }
}
@keyframes pw-drum { to { transform: rotate(360deg); } }
[data-pw-laundro] [data-part] { transform-box: view-box; }
[data-pw-laundro] [data-part="steam"] { animation: pw-steam 2.4s ease-in-out infinite; }
[data-pw-laundro] [data-part="drum"] { transform-origin: 18px 26.5px; animation: pw-drum 6s linear infinite; }
.group:is(:hover, :focus-visible) [data-pw-laundro] [data-part="drum"] { animation-duration: 0.9s; }
@media (prefers-reduced-motion: reduce) {
  [data-pw-laundro] [data-part] { animation: none; }
}
`;

const STEAM_X = [12.5, 18, 23.5];

/** Render a riso mark of a front-loading washer shaped as a coffee cup, steam rising and coffee turning in its porthole. */
function LaundroCafeMark() {
  return (
    <svg
      aria-hidden
      data-pw-laundro
      viewBox="0 0 40 40"
      className="-my-1 size-7 shrink-0 overflow-visible"
    >
      <style>{KEYFRAMES}</style>
      <g transform="translate(1.1 0.9)">
        <rect
          x={7}
          y={15}
          width={22}
          height={20}
          rx={3}
          fill="var(--pw-yellow)"
        />
        <circle
          cx={18}
          cy={26.5}
          r={6.2}
          fill="var(--pw-pink)"
          opacity={0.85}
        />
      </g>
      <defs>
        <clipPath id="pw-laundro-window">
          <circle cx={18} cy={26.5} r={4.6} />
        </clipPath>
      </defs>
      <g clipPath="url(#pw-laundro-window)">
        <g data-part="drum">
          <rect x={12} y={26.5} width={12} height={6} fill="var(--pw-orange)" />
          <path
            d="M12.5 26.5q1.4-1.3 2.8 0t2.8 0 2.8 0 2.8 0"
            fill="none"
            stroke="var(--pw-ink)"
            strokeWidth={0.8}
            strokeLinecap="round"
          />
          <circle cx={15.6} cy={23.9} r={0.7} fill="var(--pw-paper)" />
          <circle cx={19.8} cy={22.8} r={0.5} fill="var(--pw-paper)" />
        </g>
      </g>
      <g
        fill="none"
        stroke="var(--pw-ink)"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x={7} y={15} width={22} height={20} rx={3} />
        <path d="M7 19.5h22" />
        <circle cx={18} cy={26.5} r={6.2} />
        <circle cx={18} cy={26.5} r={4.6} strokeWidth={0.7} />
        <path d="M29 20h2.6a4.4 4.4 0 0 1 0 8.8H29" />
        <path d="M4 37.6h28" />
      </g>
      <g fill="var(--pw-ink)">
        <circle cx={10.4} cy={17.3} r={0.85} />
        <circle cx={13.2} cy={17.3} r={0.85} />
        <rect x={21} y={16.5} width={5} height={1.6} rx={0.4} />
      </g>
      <g
        fill="none"
        stroke="var(--pw-blue)"
        strokeWidth={1.3}
        strokeLinecap="round"
      >
        {STEAM_X.map((x, index) => (
          <path
            key={x}
            data-part="steam"
            style={{ animationDelay: `${index * 0.8}s` }}
            d={`M${x} 12.5c-1.4-1.4 1.4-2.8 0-4.2s1.4-2.8 0-4.2`}
          />
        ))}
      </g>
    </svg>
  );
}

/** Link to laundro.cafe in a new tab: the riso washer-cup mark and the site's name, the drum spinning faster while hovered or focused. */
export function LaundroCafeLink() {
  return (
    <a
      href={LAUNDROMAT_ORIGIN}
      target="_blank"
      rel="noopener"
      className={cn(
        FOCUS_RING_CLASS,
        "group flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] pr-3 pl-1.5 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      <LaundroCafeMark />
      <span className="flex-1">laundro.cafe</span>
    </a>
  );
}
