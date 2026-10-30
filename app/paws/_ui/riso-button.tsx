import { cn } from "@/lib/utils";

import { FOCUS_RING_CLASS } from "./focus-ring-class";

type RisoButtonProps = {
  children: React.ReactNode;
  variant: "primary" | "quiet";
  type?: "button" | "submit";
  form?: string;
  disabled?: boolean;
  id?: string;
  onClick?: () => void;
};

/** Render a flat button with an ink border; `primary` is yellow with a pink border offset by 3px × 2px behind it. */
export function RisoButton(props: RisoButtonProps) {
  return (
    <button
      id={props.id}
      type={props.type ?? "button"}
      form={props.form}
      disabled={props.disabled}
      onClick={props.onClick}
      className={cn(
        FOCUS_RING_CLASS,
        "relative isolate inline-flex h-10 cursor-pointer items-center justify-center px-3 text-[12px] leading-none transition-transform duration-150 disabled:cursor-default disabled:opacity-50 motion-reduce:transition-none sm:h-8",
        props.variant === "primary"
          ? "border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-yellow)] font-medium text-[var(--pw-ink)] enabled:hover:-translate-x-px enabled:hover:-translate-y-px enabled:active:translate-x-0 enabled:active:translate-y-0"
          : "border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-paper)] text-[var(--pw-ink)] enabled:hover:bg-[var(--pw-paper-deep)]"
      )}
    >
      {props.variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 translate-x-[3px] translate-y-[2px] border-[1.5px] border-[var(--pw-pink)] mix-blend-multiply"
        />
      )}
      {props.children}
    </button>
  );
}
