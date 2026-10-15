import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSceneLayout } from "./build-scene-layout";
import { computeCamera, MIN_HIT_TARGET_PX } from "./compute-camera";
import { isInteractiveSceneObject } from "./is-interactive-scene-object";
import { sceneConfig } from "./scene-config";

const layout = buildSceneLayout({ config: sceneConfig, unit: 40 });
const laptop = { width: 1280, height: 800 };

function toScreenCenter(options: {
  bounds: { x: number; y: number; width: number; height: number };
  camera: { x: number; y: number; scale: number };
}) {
  const { bounds, camera } = options;
  return {
    x: (bounds.x + bounds.width / 2) * camera.scale + camera.x,
    y: (bounds.y + bounds.height / 2) * camera.scale + camera.y,
  };
}

function findBounds(objectId: string) {
  const found = layout.objects.find(({ object }) => object.id === objectId);
  assert.ok(found, objectId);
  return found.bounds;
}

test("frames the whole room centred, inside the viewport", () => {
  const camera = computeCamera({
    focus: "room",
    viewport: laptop,
    layout,
    config: sceneConfig,
  });
  const room = { x: 0, y: 0, ...layout.size };
  const center = toScreenCenter({ bounds: room, camera });
  assert.ok(Math.abs(center.x - 640) < 1e-6);
  assert.ok(Math.abs(center.y - 400) < 1e-6);
  assert.ok(layout.size.width * camera.scale <= laptop.width);
  assert.ok(layout.size.height * camera.scale <= laptop.height);
});

test("keeps every hit target at least 24px on a laptop at room zoom", () => {
  const camera = computeCamera({
    focus: "room",
    viewport: laptop,
    layout,
    config: sceneConfig,
  });
  for (const { object, bounds } of layout.objects) {
    if (!isInteractiveSceneObject(object)) continue;
    assert.ok(bounds.width * camera.scale >= MIN_HIT_TARGET_PX, object.id);
    assert.ok(bounds.height * camera.scale >= MIN_HIT_TARGET_PX, object.id);
  }
});

test("keeps every machine control at least 24px on a laptop at room zoom", () => {
  const camera = computeCamera({
    focus: "room",
    viewport: laptop,
    layout,
    config: sceneConfig,
  });
  const controls = layout.objects.flatMap((laidOut) => laidOut.controls);
  assert.equal(controls.length, 30);
  for (const { id, bounds } of controls) {
    assert.ok(bounds.width * camera.scale >= MIN_HIT_TARGET_PX, id);
    assert.ok(bounds.height * camera.scale >= MIN_HIT_TARGET_PX, id);
  }
});

test("zooms in on a phone rather than shrinking hit targets below 24px", () => {
  const phone = { width: 390, height: 844 };
  const camera = computeCamera({
    focus: "room",
    viewport: phone,
    layout,
    config: sceneConfig,
  });
  const notebook = findBounds("notebook");
  assert.ok(
    Math.min(notebook.width, notebook.height) * camera.scale >=
      MIN_HIT_TARGET_PX - 1e-9
  );
});

for (const focus of ["shelf", "notebook", "weather"] as const) {
  test(`centres the ${focus} and leaves the room visible around it`, () => {
    const room = computeCamera({
      focus: "room",
      viewport: laptop,
      layout,
      config: sceneConfig,
    });
    const camera = computeCamera({
      focus,
      viewport: laptop,
      layout,
      config: sceneConfig,
    });
    const bounds = findBounds(sceneConfig.camera.focusTargets[focus].objectId);
    const center = toScreenCenter({ bounds, camera });
    assert.ok(Math.abs(center.x - 640) < 1e-6);
    assert.ok(Math.abs(center.y - 400) < 1e-6);
    assert.ok(camera.scale > room.scale);
    assert.ok(
      camera.scale <= room.scale * sceneConfig.camera.maxFocusZoom + 1e-9
    );
    assert.ok(bounds.width * camera.scale <= laptop.width * 0.6 + 1e-6);
    assert.ok(bounds.height * camera.scale <= laptop.height * 0.6 + 1e-6);
  });
}
