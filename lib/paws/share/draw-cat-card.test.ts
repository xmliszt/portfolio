import { createCanvas } from "@napi-rs/canvas";
import assert from "node:assert/strict";
import { test } from "node:test";

import type { AnyCanvas } from "@/lib/paws/render/render-types";
import { buildLook } from "@/lib/paws/sim/testing/build-look";

import { drawCatCard } from "./draw-cat-card";

test("draws the cat in the middle of a server canvas", () => {
  const canvas = createCanvas(240, 126);
  drawCatCard({
    g: canvas.getContext("2d") as unknown as CanvasRenderingContext2D,
    createCanvas: ({ width, height }) =>
      createCanvas(width, height) as unknown as AnyCanvas,
    look: buildLook({ coat: "black" }),
    width: 240,
    height: 126,
  });
  const g = canvas.getContext("2d");
  const lightness = (x: number, y: number) => {
    const [r = 0, gr = 0, b = 0] = g.getImageData(x, y, 1, 1).data;
    return r + gr + b;
  };
  assert.ok(
    lightness(120, 63) < lightness(5, 5) - 150,
    "the middle should hold a dark cat on light paper"
  );
});
