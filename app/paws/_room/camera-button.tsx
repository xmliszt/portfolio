import { FOCUS_RING_CLASS } from "@/app/paws/_ui/focus-ring-class";
import { cn } from "@/lib/utils";

type CameraButtonProps = {
  label: string;
  onOpen: () => void;
};

/** Render the square button beside the menu that picks up the instant camera. */
export function CameraButton(props: CameraButtonProps) {
  return (
    <button
      type="button"
      aria-label={props.label}
      title={props.label}
      onClick={props.onOpen}
      className={cn(
        FOCUS_RING_CLASS,
        "group grid size-10 shrink-0 place-items-center border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[var(--pw-ink)] hover:bg-[var(--pw-paper-deep)] sm:size-8"
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 14"
        className="h-3.5 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      >
        <path d="M1.5 3.5h3l1.2-2h4.6l1.2 2h3v9h-13z" />
        <circle
          cx="8"
          cy="8"
          r="2.6"
          className="fill-transparent transition-colors group-hover:fill-[var(--pw-pink)] group-focus-visible:fill-[var(--pw-pink)]"
        />
      </svg>
    </button>
  );
}
