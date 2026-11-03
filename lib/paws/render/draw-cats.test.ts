import { createCanvas } from "@napi-rs/canvas";
import assert from "node:assert/strict";
import { test } from "node:test";

import { deriveCat } from "@/lib/paws/sim/derive-cat";
import { buildLook } from "@/lib/paws/sim/testing/build-look";
import { buildSnapshot } from "@/lib/paws/sim/testing/build-snapshot";

import { drawCats } from "./draw-cats";
import { getCoatPalette } from "./get-coat-palette";

const look = buildLook({ belly: "coat" });
const base = getCoatPalette({ look, userId: "a" });
const palette = {
  ...base,
  spine: ["#000001", "#000002", "#000003", "#000004"],
  neck: "#000005",
  head: "#000006",
  ears: "#000007",
  thighs: ["#000008", "#000009"],
  leg: "#00000a",
  lowerLeg: "#00000b",
  sock: "#00000c",
  nose: "#00000d",
  tail: base.tail.map((_, i) => `#0001${i.toString(16).padStart(2, "0")}`),
} satisfies typeof base;

function getFillOrder(options: {
  pose: { stand: number; sit: number; sleep: number };
  sniff: number;
}) {
  const g = createCanvas(400, 400).getContext("2d");
  const order: string[] = [];
  const record = () => {
    const style = typeof g.fillStyle === "string" ? g.fillStyle : "gradient";
    if (order.at(-1) !== style) order.push(style);
  };
  const fill = g.fill.bind(g);
  const stroke = g.stroke.bind(g);
  g.fill = () => {
    record();
    fill();
  };
  g.stroke = () => {
    record();
    stroke();
  };
  const snapshot = {
    ...buildSnapshot({ userId: "a", x: 0, y: 0, pose: options.pose }),
    sniff: options.sniff,
  };
  drawCats({
    draw: { g: g as unknown as CanvasRenderingContext2D, unitPx: 1 },
    cats: [{ cat: deriveCat({ snapshot, look, time: 3 }), palette }],
  });
  return order.join(" ");
}

test("sniffing never changes which parts of a cat cover which", () => {
  for (const pose of [
    { stand: 1, sit: 0, sleep: 0 },
    { stand: 0, sit: 1, sleep: 0 },
    { stand: 0, sit: 0, sleep: 1 },
  ]) {
    const still = getFillOrder({ pose, sniff: 0 });
    for (const sniff of [0.5, 0.9, 1])
      assert.equal(
        getFillOrder({ pose, sniff }),
        still,
        `${JSON.stringify(pose)} at sniff ${sniff}`
      );
  }
});
