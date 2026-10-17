"use client";

import { useReducedMotion } from "motion/react";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { useLocalWeather } from "@/app/laundromat/local-weather/use-local-weather";
import { WeatherGlyph } from "@/app/laundromat/objects/weather-glyph";
import { useSoundBoard } from "@/app/laundromat/sound/use-sound-board";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { getWeatherConditionName } from "@/lib/laundromat/weather/get-weather-condition-name";
import { WEATHER_CONDITIONS } from "@/lib/laundromat/weather/weather-reading";
import { cn } from "@/lib/utils";

import { LiveGlyph } from "./live-glyph";
import { useRenderQuality } from "./use-render-quality";

const OPTIONS = ["live", ...WEATHER_CONDITIONS] as const;

type ConditionOption = (typeof OPTIONS)[number];

/** Let the visitor keep the live weather or pick a sky for the room with a slider over a row of weather icons, animating only the chosen icon on the full render tier. */
export function WeatherConditionSwitch() {
  const { copy } = useLaundromatCopy();
  const { reading, condition, setCondition } = useLocalWeather();
  const sound = useSoundBoard();
  const { quality } = useRenderQuality();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const isStill = quality === "lite" || prefersReducedMotion;
  const isDay = reading?.isDay ?? true;
  const selected: ConditionOption = condition ?? "live";

  function choose(next: ConditionOption) {
    if (next === selected) return;
    sound?.play("knob-click");
    setCondition(next === "live" ? undefined : next);
  }

  function getName(option: ConditionOption) {
    return option === "live"
      ? copy.settings.conditionLive
      : getWeatherConditionName({
          reading: { condition: option, isDay },
          copy,
        });
  }

  function drawGlyph(option: ConditionOption) {
    if (option === "live") return <LiveGlyph />;
    return (
      <WeatherGlyph
        condition={option}
        isDay={isDay}
        animated={option === selected && !isStill}
        motionSeconds={sceneConfig.details.weatherPanel.glyphMotionSeconds}
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={copy.settings.conditionLabel}
      className="relative grid grid-cols-7 rounded-full p-0.5 shadow-[inset_0_0_0_1px_var(--lm-edge)]"
    >
      <span
        aria-hidden
        className="absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/7)] rounded-full bg-[var(--lm-accent)] transition-transform duration-200 ease-out motion-reduce:transition-none"
        style={{
          transform: `translateX(${OPTIONS.indexOf(selected) * 100}%)`,
        }}
      />
      {OPTIONS.map((option) => {
        const isSelected = option === selected;
        return (
          <label
            key={option}
            title={getName(option)}
            className={cn(
              "relative flex h-8 cursor-pointer items-center justify-center rounded-full transition-opacity has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-[var(--lm-ink-hi)]",
              isSelected
                ? "[--lm-thumb:var(--lm-accent)]"
                : "opacity-60 hover:opacity-100"
            )}
          >
            <input
              type="radio"
              name="weather-condition"
              value={option}
              checked={isSelected}
              onChange={() => choose(option)}
              aria-label={getName(option)}
              className="sr-only"
            />
            <svg
              aria-hidden
              viewBox="-12 -12 24 24"
              className={cn(
                "size-5 overflow-visible",
                isSelected &&
                  "[--lm-accent:var(--lm-panel)] [--lm-ink-hi:var(--lm-panel)] [--lm-recess:var(--lm-thumb)]"
              )}
            >
              {drawGlyph(option)}
            </svg>
          </label>
        );
      })}
    </div>
  );
}
