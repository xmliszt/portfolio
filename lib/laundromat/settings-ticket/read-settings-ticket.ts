import { clampRoomSoundVolume } from "@/lib/laundromat/audio/clamp-room-sound-volume";
import { ROOM_SOUND_GROUPS } from "@/lib/laundromat/audio/room-sound-groups";
import { RENDER_QUALITY_PREFERENCES } from "@/lib/laundromat/render-quality/render-quality";
import { TV_STATION_IDS } from "@/lib/laundromat/tv/tv-state";

import type { ReadSettingsTicket } from "./settings-ticket";
import { SETTINGS_TICKET_APP, SETTINGS_TICKET_KIND } from "./settings-ticket";

function isObject(value: unknown): value is { [key: string]: unknown } {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readTv(value: unknown) {
  if (!isObject(value)) return undefined;
  const station = TV_STATION_IDS.find((id) => id === value.station);
  const volumePercent = value.volumePercent;
  const isWholePercent =
    typeof volumePercent === "number" &&
    Number.isInteger(volumePercent) &&
    volumePercent >= 0 &&
    volumePercent <= 100;
  if (station === undefined || !isWholePercent) return undefined;
  return { station, volumePercent };
}

/** Return the settings held in `value`, a parsed ticket file, or `undefined` when it is not a laundro.cafe settings ticket; unknown keys are ignored, volumes are clamped into range, and unreadable fields come back `undefined`. */
export function readSettingsTicket(
  value: unknown
): ReadSettingsTicket | undefined {
  if (
    !isObject(value) ||
    value.app !== SETTINGS_TICKET_APP ||
    value.kind !== SETTINGS_TICKET_KIND ||
    !isObject(value.settings)
  ) {
    return undefined;
  }
  const { settings } = value;
  const roomSounds = isObject(settings.roomSounds) ? settings.roomSounds : {};
  const entries = ROOM_SOUND_GROUPS.map((group) => {
    const entry = roomSounds[group];
    return {
      group,
      on:
        isObject(entry) && typeof entry.on === "boolean" ? entry.on : undefined,
      volume: isObject(entry) ? clampRoomSoundVolume(entry.volume) : undefined,
    };
  });
  return {
    printedAt:
      typeof value.printedAt === "string" &&
      !Number.isNaN(Date.parse(value.printedAt))
        ? value.printedAt
        : undefined,
    renderQuality: RENDER_QUALITY_PREFERENCES.find(
      (preference) => preference === settings.renderQuality
    ),
    temperatureUnit:
      settings.temperatureUnit === "celsius" ||
      settings.temperatureUnit === "fahrenheit"
        ? settings.temperatureUnit
        : undefined,
    muted:
      settings.sound === "on" || settings.sound === "off"
        ? settings.sound === "off"
        : undefined,
    switches: Object.fromEntries(
      entries.flatMap((entry) =>
        entry.on === undefined ? [] : [[entry.group, entry.on]]
      )
    ),
    volumes: Object.fromEntries(
      entries.flatMap((entry) =>
        entry.volume === undefined ? [] : [[entry.group, entry.volume]]
      )
    ),
    tv: readTv(settings.tv),
  };
}
