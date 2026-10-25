"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import type { TemperatureUnit } from "@/lib/laundromat/weather/weather-reading";
import { cn } from "@/lib/utils";

import { SETTINGS_META_CLASS } from "./settings-meta-class";

const UNIT_SYMBOLS = {
  celsius: "°C",
  fahrenheit: "°F",
} satisfies { [unit in TemperatureUnit]: string };

const TEMPERATURE_UNITS: TemperatureUnit[] = ["celsius", "fahrenheit"];

/** Let the visitor switch the weather panel between °C and °F with a two-position slider. */
export function TemperatureUnitSwitch() {
  const { copy } = useLaundromatCopy();
  const { unit, setUnit } = useLocalWeather();
  const sound = useSoundBoard();

  function choose(next: TemperatureUnit) {
    if (next === unit) return;
    sound?.play("knob-click");
    setUnit(next);
  }

  return (
    <div className="flex items-center justify-between gap-x-3">
      <span
        id="temperature-unit-label"
        className={cn(SETTINGS_META_CLASS, "opacity-80")}
      >
        {copy.settings.temperature}
      </span>
      <div
        role="radiogroup"
        aria-labelledby="temperature-unit-label"
        className="relative grid grid-cols-2 rounded-full p-0.5 shadow-[inset_0_0_0_1px_var(--lm-edge)]"
      >
        <span
          aria-hidden
          className={cn(
            "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-[var(--lm-accent)] transition-transform duration-200 ease-out motion-reduce:transition-none",
            unit === "fahrenheit" && "translate-x-full"
          )}
        />
        {TEMPERATURE_UNITS.map((option) => (
          <label
            key={option}
            className={cn(
              "relative flex h-7 w-11 cursor-pointer items-center justify-center rounded-full font-[family-name:var(--lm-font-mono)] text-[13px] transition-colors has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-[var(--lm-ink-hi)]",
              option === unit
                ? "text-[var(--lm-panel)]"
                : "text-[var(--lm-ink)] hover:text-[var(--lm-ink-hi)]"
            )}
          >
            <input
              type="radio"
              name="temperature-unit"
              value={option}
              checked={option === unit}
              onChange={() => choose(option)}
              className="sr-only"
            />
            {UNIT_SYMBOLS[option]}
          </label>
        ))}
      </div>
    </div>
  );
}
