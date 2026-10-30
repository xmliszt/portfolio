import { useId } from "react";

import { cn } from "@/lib/utils";

type SwatchPickerProps<T extends string> = {
  legend: string;
  name: string;
  options: readonly { value: T; label: string; fill: string }[];
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
};

/** Render a labelled row of round ink swatches as radio options, naming the chosen one beside the legend. */
export function SwatchPicker<T extends string>(props: SwatchPickerProps<T>) {
  const id = useId();
  const chosen = props.options.find((option) => option.value === props.value);

  return (
    <fieldset disabled={props.disabled} className="flex min-w-0 flex-col">
      <legend className="mb-1 flex gap-x-2 text-[12px] text-[var(--pw-ink-soft)]">
        <span>{props.legend}</span>
        <span aria-hidden className="text-[var(--pw-ink)]">
          {chosen?.label}
        </span>
      </legend>
      <div className="flex flex-wrap gap-x-1 gap-y-1 sm:gap-x-1.5 sm:gap-y-1.5">
        {props.options.map((option) => {
          const optionId = `${id}-${option.value}`;
          const isChecked = option.value === props.value;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              title={option.label}
              className={cn(
                "grid size-9 cursor-pointer place-items-center rounded-full border-[1.5px] sm:size-7",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--pw-blue)] has-[:focus-visible]:outline-solid",
                isChecked
                  ? "border-[var(--pw-ink)]"
                  : "border-transparent hover:border-[var(--pw-rule)]"
              )}
            >
              <input
                id={optionId}
                type="radio"
                name={`${props.name}-${id}`}
                value={option.value}
                checked={isChecked}
                aria-label={option.label}
                onChange={() => props.onChange(option.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                style={{ background: option.fill }}
                className="size-5 rounded-full ring-[1.5px] ring-[var(--pw-ink)]/25 ring-inset"
              />
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
