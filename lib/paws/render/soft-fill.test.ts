import { createCanvas } from "@napi-rs/canvas";
import assert from "node:assert/strict";
import { test } from "node:test";

import { softFill } from "./soft-fill";

test("the soft edge shifts toward `edgeFade`, more on the outer strokes", () => {
  const g = createCanvas(40, 40).getContext("2d");
  const strokes: string[] = [];
  const stroke = g.stroke.bind(g);
  g.stroke = () => {
    if (typeof g.strokeStyle === "string") strokes.push(g.strokeStyle);
    stroke();
  };
  softFill({
    draw: { g: g as unknown as CanvasRenderingContext2D, unitPx: 1 },
    trace: () => g.rect(10, 10, 20, 20),
    blur: 4,
    color: "#000000",
    edgeFade: "#ffffff",
  });
  assert.deepEqual(strokes, [
    "#d9d9d9",
    "#9f9f9f",
    "#6c6c6c",
    "#414141",
    "#161616",
  ]);
});
