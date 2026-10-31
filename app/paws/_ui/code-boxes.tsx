import { CODE_LENGTH } from "@/lib/paws/maker/read-code-input";
import { cn } from "@/lib/utils";

type CodeBoxesProps = {
  code: string;
  focused: boolean;
  invalid: boolean;
  disabled: boolean;
};

/** Render one box per code digit showing `code`, the box for the next digit outlined while `focused`. */
export function CodeBoxes(props: CodeBoxesProps) {
  const activeIndex = Math.min(props.code.length, CODE_LENGTH - 1);
  return (
    <div
      aria-hidden
      className={cn(
        "grid grid-cols-6 gap-x-1.5",
        props.disabled && "opacity-60"
      )}
    >
      {Array.from({ length: CODE_LENGTH }, (_, index) => {
        const digit = props.code.at(index);
        const isActive = props.focused && index === activeIndex;
        return (
          <div
            key={index}
            className={cn(
              "flex h-11 items-center justify-center border-[1.5px] bg-[var(--pw-paper)] text-[20px] text-[var(--pw-ink)] tabular-nums transition-colors duration-150",
              isActive
                ? "border-[var(--pw-orange)] outline-[1.5px] outline-[var(--pw-orange)] outline-solid"
                : props.invalid
                  ? "border-[var(--pw-pink)]"
                  : "border-[var(--pw-ink)]"
            )}
          >
            {digit ??
              (isActive && (
                <span className="h-5 w-[1.5px] bg-[var(--pw-ink)] motion-safe:animate-pulse" />
              ))}
          </div>
        );
      })}
    </div>
  );
}
