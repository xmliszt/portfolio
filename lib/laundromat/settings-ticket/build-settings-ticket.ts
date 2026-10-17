import type {
  RoomSoundSwitches,
  RoomSoundVolumes,
} from "@/lib/laundromat/audio/room-sound-groups";
import type { RenderQualityPreference } from "@/lib/laundromat/render-quality/render-quality";
import type { TemperatureUnit } from "@/lib/laundromat/weather/weather-reading";

import type { SettingsTicket, SettingsTicketTv } from "./settings-ticket";
import {
  SETTINGS_TICKET_APP,
  SETTINGS_TICKET_KIND,
  SETTINGS_TICKET_VERSION,
} from "./settings-ticket";

/** Return a settings ticket holding the visitor's current choices, printed at `printedAt`, leaving out `tv` when it is `undefined`. */
export function buildSettingsTicket(options: {
  printedAt: Date;
  renderQuality: RenderQualityPreference;
  temperatureUnit: TemperatureUnit;
  muted: boolean;
  switches: RoomSoundSwitches;
  volumes: RoomSoundVolumes;
  tv: SettingsTicketTv | undefined;
}): SettingsTicket {
  const { switches, volumes } = options;
  return {
    app: SETTINGS_TICKET_APP,
    kind: SETTINGS_TICKET_KIND,
    version: SETTINGS_TICKET_VERSION,
    printedAt: options.printedAt.toISOString(),
    settings: {
      renderQuality: options.renderQuality,
      temperatureUnit: options.temperatureUnit,
      sound: options.muted ? "off" : "on",
      roomSounds: {
        machines: { on: switches.machines, volume: volumes.machines },
        "shop-bell": {
          on: switches["shop-bell"],
          volume: volumes["shop-bell"],
        },
        unloading: { on: switches.unloading, volume: volumes.unloading },
        coffee: { on: switches.coffee, volume: volumes.coffee },
        tv: { on: switches.tv, volume: volumes.tv },
        lamp: { on: switches.lamp, volume: volumes.lamp },
        weather: { on: switches.weather, volume: volumes.weather },
      },
      ...(options.tv === undefined ? {} : { tv: options.tv }),
    },
  };
}
