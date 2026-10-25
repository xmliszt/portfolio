import assert from "node:assert/strict";
import { test } from "node:test";

import { getBoxFaces } from "@/lib/laundromat/get-box-faces";
import type { ScreenPoint } from "@/lib/laundromat/project-iso-point";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { getToyFlightFrame } from "@/lib/laundromat/toy/get-toy-flight-frame";
import { projectToyCar } from "@/lib/laundromat/toy/project-toy-car";
import { TOY_FLIGHT } from "@/lib/laundromat/toy/toy-flight-timeline";

import { themes } from "./themes";

function bounds(points: ScreenPoint[]) {
  return {
    left: Math.min(...points.map((point) => point.x)),
    right: Math.max(...points.map((point) => point.x)),
    top: Math.min(...points.map((point) => point.y)),
    bottom: Math.max(...points.map((point) => point.y)),
  };
}

test("Halloween decorations leave the entire projected flying-car path clear", () => {
  const toy = sceneConfig.objects.find((object) => object.kind === "toy-set");
  assert.ok(toy);
  const projection = { unit: 62, origin: { x: 0, y: 0 } };
  const decorations = themes.halloween.objects.map((object) => {
    const faces = getBoxFaces({
      position: object.position,
      size: object.size,
      projection,
    });
    return {
      id: object.id,
      bounds: bounds([...faces.top, ...faces.front, ...faces.side]),
    };
  });
  for (const elapsedMs of Array.from(
    { length: Math.ceil(TOY_FLIGHT.totalMs / 25) + 1 },
    (_, index) => index * 25
  )) {
    const frame = getToyFlightFrame({ elapsedMs, origin: toy.position });
    const car = bounds(
      projectToyCar({ pose: frame.pose, projection }).flatMap(
        (face) => face.points
      )
    );
    for (const decoration of decorations) {
      const box = decoration.bounds;
      assert.ok(
        car.right < box.left ||
          car.left > box.right ||
          car.bottom < box.top ||
          car.top > box.bottom,
        `${decoration.id} covers the car during ${frame.phase} at ${elapsedMs}ms`
      );
    }
  }
});
