"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import { cn } from "@/lib/utils";

import { SETTINGS_META_CLASS } from "./settings-meta-class";
import { TemperatureUnitSwitch } from "./temperature-unit-switch";
import { WeatherConditionSwitch } from "./weather-condition-switch";
import { WeatherPlacePicker } from "./weather-place-picker";

/** Group the weather settings: the place the weather comes from, the sky, and the temperature unit, with a note on how the live weather is found. */
export function WeatherFieldset() {
  const { copy } = useLaundromatCopy();
  return (
    <fieldset className="m-0 flex flex-col gap-y-3 border-0 p-0">
      <legend className="sr-only">{copy.settings.weather}</legend>
      <span aria-hidden className={cn(SETTINGS_META_CLASS, "opacity-80")}>
        {copy.settings.weather}
      </span>
      <div className="flex flex-col gap-y-2">
        <WeatherPlacePicker />
        <WeatherConditionSwitch />
      </div>
      <TemperatureUnitSwitch />
      <p className="m-0 font-[family-name:var(--lm-font-display)] text-[13px] leading-5 text-pretty opacity-80">
        {copy.settings.weatherHint}
      </p>
    </fieldset>
  );
}
