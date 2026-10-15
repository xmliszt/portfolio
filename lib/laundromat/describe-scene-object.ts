import type { LaundromatCopy } from "./i18n/laundromat-copy";
import { formatTemperature } from "./weather/format-temperature";
import { getAqiBand } from "./weather/get-aqi-band";
import { getWeatherConditionName } from "./weather/get-weather-condition-name";
import type { WeatherReading } from "./weather/weather-reading";
import type { SceneObject } from "./scene-config";

/** Return the hit target's `label` and `tooltip` for `object`, counting `peopleHere` on the tube display and reading `weather` and its air quality on the weather panel, or `undefined` when the object is not interactive. */
export function describeSceneObject(options: {
  object: SceneObject;
  copy: LaundromatCopy;
  peopleHere?: number;
  weather?: WeatherReading;
}) {
  const { object, copy } = options;
  switch (object.kind) {
    case "washer":
    case "dryer": {
      const name = copy.machine.name(object);
      return {
        label: copy.machine.freeLabel({ name }),
        tooltip: copy.machine.freeTooltip({
          name: name.toLocaleLowerCase(copy.locale),
        }),
      };
    }
    case "tv":
      return { label: copy.tv.offLabel, tooltip: copy.tv.offTooltip };
    case "coffee-machine":
      return {
        label: copy.coffee.machineLabel,
        tooltip: copy.coffee.idleSwitchTooltip,
      };
    case "shelf":
      return {
        label: copy.shelf.loadingLabel,
        tooltip: copy.shelf.loadingTooltip,
      };
    case "notebook":
      return {
        label: copy.notebook.objectLabel,
        tooltip: copy.notebook.objectTooltip,
      };
    case "mat":
      return {
        label: copy.entranceMat.awayLabel,
        tooltip: copy.entranceMat.awayTooltip,
      };
    case "mug":
      return {
        label: copy.coffee.emptyCupLabel,
        tooltip: copy.coffee.emptyCupTooltip,
      };
    case "plant":
      return { label: copy.plant.label, tooltip: copy.plant.tooltip };
    case "board":
      return { label: copy.board.label, tooltip: copy.board.tooltip };
    case "basket":
      return {
        label: copy.laundryBasket.labels.empty,
        tooltip: copy.laundryBasket.tooltips.empty,
      };
    case "tube-display":
      return options.peopleHere === undefined
        ? {
            label: copy.tubeDisplay.offLabel,
            tooltip: copy.tubeDisplay.offTooltip,
          }
        : {
            label: copy.tubeDisplay.label({ count: options.peopleHere }),
            tooltip: copy.tubeDisplay.tooltip({ count: options.peopleHere }),
          };
    case "weather-panel": {
      const { weather } = options;
      if (weather === undefined) {
        return {
          label: copy.weatherPanel.offLabel,
          tooltip: copy.weatherPanel.offTooltip,
        };
      }
      const reading = {
        temperature: formatTemperature({
          celsius: weather.temperatureC,
          unit: weather.unit,
        }),
        condition: getWeatherConditionName({ reading: weather, copy }),
        place: weather.city ?? copy.weatherPanel.outside,
      };
      if (weather.aqi === undefined) {
        return {
          label: copy.weatherPanel.label(reading),
          tooltip: copy.weatherPanel.tooltip(reading),
        };
      }
      const air = {
        aqi: weather.aqi,
        band: copy.weatherPanel.aqiBands[getAqiBand(weather.aqi)],
      };
      return {
        label: `${copy.weatherPanel.label(reading)}, ${copy.weatherPanel.airLabel(air)}`,
        tooltip: `${copy.weatherPanel.tooltip(reading)} · ${copy.weatherPanel.airTooltip(air)}`,
      };
    }
    case "counter":
    case "window":
    case "clock":
    case "table":
    case "stool":
      return undefined;
    default: {
      const unhandled: never = object;
      return unhandled;
    }
  }
}
