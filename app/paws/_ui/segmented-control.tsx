import { useId } from "react";

import { cn } from "@/lib/utils";

type SegmentedControlProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly { value: T; label: string }[];
  value: T;
  columns: number;
  disabled?: boolean;
  onChange: (value: T) => void;
};

/** Render a labelled grid of radio options, the last option spanning the rest of its row. */
export function SegmentedControl<T extends string>(
  props: SegmentedControlProps<T>
) {
  const id = useId();
  const leftover = props.options.length % props.columns;

  return (
    <fieldset disabled={props.disabled} className="flex min-w-0 flex-col">
      <legend className="mb-1 text-[12px] text-[var(--pw-ink-soft)]">
        {props.legend}
      </legend>
      <div
        style={{
          gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
        }}
        className="grid gap-x-[1.5px] gap-y-[1.5px] border-[1.5px] border-[var(--pw-ink)] bg-[var(--pw-ink)]"
      >
        {props.options.map((option, index) => {
          const optionId = `${id}-${option.value}`;
          const isChecked = option.value === props.value;
          const isLast = index === props.options.length - 1;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              style={
                isLast && leftover > 0
                  ? { gridColumn: `span ${props.columns - leftover + 1}` }
                  : undefined
              }
              className={cn(
                "relative flex h-9 min-w-0 items-center justify-center px-0.5 text-[12px] leading-none sm:h-7",
                "has-[:focus-visible]:z-10 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--pw-blue)] has-[:focus-visible]:outline-solid",
                isChecked
                  ? "bg-[var(--pw-ink)] text-[var(--pw-paper)]"
                  : "bg-[var(--pw-paper)] hover:bg-[var(--pw-paper-deep)]"
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={`${props.name}-${id}`}
                value={option.value}
                checked={isChecked}
                onChange={() => props.onChange(option.value)}
                className="sr-only"
              />
              <span className="truncate py-0.5 leading-normal">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
