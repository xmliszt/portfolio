import assert from "node:assert/strict";
import { test } from "node:test";

import { buildSceneLayout } from "@/lib/laundromat/build-scene-layout";
import { computeCamera } from "@/lib/laundromat/compute-camera";
import { sceneConfig } from "@/lib/laundromat/scene-config";

import { getPlantAnchor } from "./get-plant-anchor";

const layout = buildSceneLayout({ config: sceneConfig, unit: 40 });
const viewport = { width: 1280, height: 800 };

test("the anchor sits on the top centre of the plant's hit bounds inside the viewport", () => {
  const anchor = getPlantAnchor({
    layout,
    viewport,
    focus: "room",
    config: sceneConfig,
  });
  const plant = layout.objects.find(({ object }) => object.kind === "plant");
  assert.ok(anchor);
  assert.ok(plant);
  const camera = computeCamera({
    focus: "room",
    viewport,
    layout,
    config: sceneConfig,
  });
  assert.equal(
    anchor.x,
    (plant.bounds.x + plant.bounds.width / 2) * camera.scale + camera.x
  );
  assert.equal(anchor.y, plant.bounds.y * camera.scale + camera.y);
  assert.ok(anchor.x > 0 && anchor.x < viewport.width);
  assert.ok(anchor.y > 0 && anchor.y < viewport.height);
});

test("there is no anchor when the layout has no plant", () => {
  const anchor = getPlantAnchor({
    layout: buildSceneLayout({
      config: {
        ...sceneConfig,
        objects: sceneConfig.objects.filter(
          (object) => object.kind !== "plant"
        ),
      },
      unit: 40,
    }),
    viewport,
    focus: "room",
    config: sceneConfig,
  });
  assert.equal(anchor, undefined);
});
