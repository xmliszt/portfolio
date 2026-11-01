import assert from "node:assert/strict";
import { test } from "node:test";

import { isFootprintInFront } from "./is-footprint-in-front";
import { sceneConfig } from "./scene-config";

function findObject(id: string) {
  const object = sceneConfig.objects.find((candidate) => candidate.id === id);
  assert.ok(object, `scene has ${id}`);
  return object;
}

test("the air purifier stands in front of the toy box", () => {
  assert.equal(
    isFootprintInFront({
      front: findObject("air-purifier"),
      back: findObject("toy-box"),
    }),
    true
  );
});

test("objects on the left wall behind the toy box are not in front of it", () => {
  for (const id of ["window", "weather-panel", "shelf", "tv"]) {
    assert.equal(
      isFootprintInFront({
        front: findObject(id),
        back: findObject("toy-box"),
      }),
      false,
      id
    );
  }
});

test("an object off to the side with no overlap is not in front", () => {
  assert.equal(
    isFootprintInFront({
      front: findObject("washer-1"),
      back: findObject("toy-box"),
    }),
    false
  );
});
