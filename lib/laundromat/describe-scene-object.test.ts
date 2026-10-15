import assert from "node:assert/strict";
import { test } from "node:test";

import { en } from "@/lib/laundromat/i18n/copy/en";

import { describeSceneObject } from "./describe-scene-object";
import { isInteractiveSceneObject } from "./is-interactive-scene-object";
import { sceneConfig } from "./scene-config";

test("gives every machine, every focus target, the mat, the mug, the plant, the basket, the tube display, the weather panel and the air purifier a label and tooltip", () => {
  const interactiveIds = sceneConfig.objects
    .filter((object) => describeSceneObject({ object, copy: en }) !== undefined)
    .map((object) => object.id);
  assert.deepEqual(interactiveIds.toSorted(), [
    "air-purifier",
    "basket",
    "board",
    "coffee-machine",
    "dryer-1",
    "dryer-2",
    "dryer-3",
    "dryer-4",
    "mat",
    "mug",
    "notebook",
    "plant",
    "shelf",
    "tube-display",
    "tv",
    "washer-1",
    "washer-2",
    "washer-3",
    "washer-4",
    "weather-panel",
  ]);
});

test("numbers machine labels", () => {
  const washer = sceneConfig.objects.find((object) => object.id === "washer-2");
  assert.ok(washer);
  assert.deepEqual(describeSceneObject({ object: washer, copy: en }), {
    label: "Washer 2, free",
    tooltip: "washer 2 · free",
  });
});

test("marks the same objects interactive as it describes", () => {
  for (const object of sceneConfig.objects) {
    assert.equal(
      isInteractiveSceneObject(object),
      describeSceneObject({ object, copy: en }) !== undefined,
      object.id
    );
  }
});

test("reads the weather panel's temperature, condition and city", () => {
  const panel = sceneConfig.objects.find(
    (object) => object.id === "weather-panel"
  );
  assert.ok(panel);
  assert.deepEqual(
    describeSceneObject({
      object: panel,
      copy: en,
      weather: {
        condition: "clear",
        isDay: true,
        temperatureC: 20,
        highC: 24,
        lowC: 15,
        city: "Austin",
        unit: "fahrenheit",
        aqi: undefined,
      },
    }),
    {
      label: "Weather panel, 68° and sunny, Austin",
      tooltip: "68° · sunny · Austin",
    }
  );
  assert.equal(
    describeSceneObject({
      object: panel,
      copy: en,
      weather: {
        condition: "clear",
        isDay: false,
        temperatureC: 10,
        highC: 14,
        lowC: 8,
        city: undefined,
        unit: "celsius",
        aqi: undefined,
      },
    })?.tooltip,
    "10° · clear · outside"
  );
  assert.deepEqual(describeSceneObject({ object: panel, copy: en }), {
    label: "Weather panel, no reading",
    tooltip: "no reading yet",
  });
});

test("adds the air quality band when the reading has an AQI", () => {
  const panel = sceneConfig.objects.find(
    (object) => object.id === "weather-panel"
  );
  assert.ok(panel);
  assert.deepEqual(
    describeSceneObject({
      object: panel,
      copy: en,
      weather: {
        condition: "fog",
        isDay: true,
        temperatureC: 27,
        highC: 30,
        lowC: 25,
        city: "Singapore",
        unit: "celsius",
        aqi: 169,
      },
    }),
    {
      label:
        "Weather panel, 27° and fog, Singapore, air quality unhealthy, AQI 169",
      tooltip: "27° · fog · Singapore · air unhealthy",
    }
  );
});
