import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { cn } from "@/lib/utils";

type SheetButtonProps = {
  icon: "guide" | "note";
  label: string;
  onOpen: () => void;
};

function SheetIcon(props: { icon: SheetButtonProps["icon"] }) {
  switch (props.icon) {
    case "guide":
      return (
        <span
          aria-hidden
          className="grid size-3.5 shrink-0 place-items-center border-[1.2px] border-current bg-transparent text-[9px] leading-none font-medium transition-colors group-hover:bg-[var(--pw-yellow)] group-focus-visible:bg-[var(--pw-yellow)]"
        >
          ?
        </span>
      );
    case "note":
      return (
        <svg
          aria-hidden
          viewBox="0 0 14 14"
          className="size-3.5 shrink-0 overflow-visible"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        >
          <rect
            x="1.5"
            y="4.5"
            width="11"
            height="8"
            className="fill-transparent transition-colors group-hover:fill-[var(--pw-orange)] group-focus-visible:fill-[var(--pw-orange)]"
          />
          <path
            d="M1.5 4.5 7 9l5.5-4.5"
            className="origin-top fill-transparent transition-[transform,fill] duration-200 ease-out [transform-box:fill-box] group-hover:-scale-y-100 group-hover:fill-[var(--pw-orange)] group-focus-visible:-scale-y-100 group-focus-visible:fill-[var(--pw-orange)] motion-reduce:transition-none"
          />
        </svg>
      );
    default: {
      const unknown: never = props.icon;
      return unknown;
    }
  }
}

/** Render a menu row that opens a sheet: the `icon` and `label` in the menu's bordered row. */
export function SheetButton(props: SheetButtonProps) {
  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={props.onOpen}
      className={cn(
        FOCUS_RING_CLASS,
        "group flex h-10 items-center gap-x-2 border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] px-3 text-[12px] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:h-8"
      )}
    >
      <SheetIcon icon={props.icon} />
      <span className="min-w-0 flex-1 truncate text-left">{props.label}</span>
    </button>
  );
}
