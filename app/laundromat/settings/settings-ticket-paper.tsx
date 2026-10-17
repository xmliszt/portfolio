"use client";

import { useLaundromatCopy } from "@/app/laundromat/i18n/use-laundromat-copy";
import type {
  RoomSoundSwitches,
  RoomSoundVolumes,
} from "@/lib/laundromat/audio/room-sound-groups";
import {
  ROOM_SOUND_GROUPS,
  ROOM_SOUND_VOLUME,
} from "@/lib/laundromat/audio/room-sound-groups";
import type { RenderQualityPreference } from "@/lib/laundromat/render-quality/render-quality";
import { getTicketNumber } from "@/lib/laundromat/settings-ticket/get-ticket-number";
import type { TemperatureUnit } from "@/lib/laundromat/weather/weather-reading";
import { cn } from "@/lib/utils";

const UNIT_SYMBOLS = {
  celsius: "°c",
  fahrenheit: "°f",
} satisfies { [unit in TemperatureUnit]: string };

type SettingsTicketPaperProps = {
  printedAt: Date;
  renderQuality: RenderQualityPreference;
  temperatureUnit: TemperatureUnit;
  switches: RoomSoundSwitches;
  volumes: RoomSoundVolumes;
  tvVolumePercent: number | undefined;
};

/** Render a paper laundry ticket listing each room sound's level, the temperature unit, the rendering choice and the tv volume, numbered from `printedAt`. */
export function SettingsTicketPaper(props: SettingsTicketPaperProps) {
  const { copy } = useLaundromatCopy();
  const ticketNumber = getTicketNumber(props.printedAt);
  const printedAt = new Intl.DateTimeFormat(copy.locale, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(props.printedAt);
  const qualityLabels = {
    auto: copy.settings.qualityAuto,
    full: copy.settings.qualityFull,
    lite: copy.settings.qualityLite,
  } satisfies { [option in RenderQualityPreference]: string };

  return (
    <span className="flex w-full max-w-[236px] shrink-0 flex-col gap-y-2 bg-[linear-gradient(180deg,#e2dbcc,#d9d1c1_30%,#cec6b6)] px-3.5 pt-3.5 pb-4.5 font-[family-name:var(--lm-font-mono)] text-[10px] leading-[15px] text-[#2b2620] lowercase shadow-[0_-2px_10px_rgb(0_0_0/0.4)] [mask:conic-gradient(from_135deg_at_top,#0000,#000_1deg_89deg,#0000_90deg)_50%/8px_100%]">
      <span className="flex items-baseline justify-between gap-x-2">
        <span className="font-[family-name:var(--lm-font-display)] text-[15px] leading-[18px] normal-case">
          {copy.site.name}
        </span>
        <span>{copy.settings.ticket.number({ number: ticketNumber })}</span>
      </span>
      <span className="flex justify-between gap-x-2 opacity-70">
        <span>{copy.settings.ticket.title}</span>
        <span>{printedAt}</span>
      </span>
      <span className="h-px bg-[repeating-linear-gradient(90deg,rgb(43_38_32/0.45)_0_3px,transparent_3px_6px)]" />
      <span className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-px">
        {ROOM_SOUND_GROUPS.map((group) => {
          const isOn = props.switches[group];
          return (
            <span key={group} className="contents">
              <span className={cn(!isOn && "line-through opacity-45")}>
                {copy.settings.roomSound[group].label}
              </span>
              <span>
                {isOn && (
                  <span
                    className="block h-[5px] bg-[repeating-linear-gradient(90deg,#2b2620_0_3px,transparent_3px_4px)] opacity-75"
                    style={{
                      width: `${(props.volumes[group] / ROOM_SOUND_VOLUME.max) * 100}%`,
                    }}
                  />
                )}
              </span>
              <span className={cn(!isOn && "opacity-45")}>
                {isOn
                  ? `${Math.round(props.volumes[group] * 100)}%`
                  : copy.settings.roomSoundOff}
              </span>
            </span>
          );
        })}
      </span>
      <span className="h-px bg-[repeating-linear-gradient(90deg,rgb(43_38_32/0.45)_0_3px,transparent_3px_6px)]" />
      <span className="flex justify-between gap-x-2 opacity-70">
        <span>
          {UNIT_SYMBOLS[props.temperatureUnit]} ·{" "}
          {qualityLabels[props.renderQuality]}
        </span>
        {props.tvVolumePercent !== undefined && (
          <span>
            {copy.settings.ticket.tv({ percent: props.tvVolumePercent })}
          </span>
        )}
      </span>
    </span>
  );
}
