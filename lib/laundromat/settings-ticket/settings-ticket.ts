import type {
  RoomSoundGroup,
  RoomSoundSwitches,
  RoomSoundVolumes,
} from "@/lib/laundromat/audio/room-sound-groups";
import type { RenderQualityPreference } from "@/lib/laundromat/render-quality/render-quality";
import type { TvStationId } from "@/lib/laundromat/tv/tv-state";
import type { TemperatureUnit } from "@/lib/laundromat/weather/weather-reading";

export const SETTINGS_TICKET_APP = "laundro.cafe";
export const SETTINGS_TICKET_KIND = "settings";
export const SETTINGS_TICKET_VERSION = 1;
export const SETTINGS_TICKET_FILE_EXTENSION = ".ticket";
export const SETTINGS_TICKET_HEADER = "laundro.cafe laundry ticket";
export const SETTINGS_TICKET_CODE_PREFIX = "LT1.";
export const SETTINGS_TICKET_HASH_PREFIX = "#ticket=";

export type SettingsTicketTv = { station: TvStationId; volumePercent: number };

export type SettingsTicket = {
  app: typeof SETTINGS_TICKET_APP;
  kind: typeof SETTINGS_TICKET_KIND;
  version: typeof SETTINGS_TICKET_VERSION;
  printedAt: string;
  settings: {
    renderQuality: RenderQualityPreference;
    temperatureUnit: TemperatureUnit;
    sound: "on" | "off";
    roomSounds: { [group in RoomSoundGroup]: { on: boolean; volume: number } };
    tv?: SettingsTicketTv;
  };
};

/** The settings read back from a ticket; a field is `undefined` when the ticket did not hold a readable value for it. */
export type ReadSettingsTicket = {
  printedAt: string | undefined;
  renderQuality: RenderQualityPreference | undefined;
  temperatureUnit: TemperatureUnit | undefined;
  muted: boolean | undefined;
  switches: { [group in RoomSoundGroup]?: RoomSoundSwitches[group] };
  volumes: { [group in RoomSoundGroup]?: RoomSoundVolumes[group] };
  tv: SettingsTicketTv | undefined;
};
