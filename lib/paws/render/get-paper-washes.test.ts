import assert from "node:assert/strict";
import { test } from "node:test";

import { getPaperWashes } from "./get-paper-washes";
import { PAPER_PALETTES } from "./paper-palettes";

const size = { width: 1000, height: 600 };

test("the seed picks the palette and the same time gives the same washes", () => {
  const washes = getPaperWashes({ seed: 0, time: 0, ...size });
  assert.deepEqual(
    washes.map((wash) => wash.ink),
    [PAPER_PALETTES[0].edge, PAPER_PALETTES[0].glow, PAPER_PALETTES[0].corner]
  );
  assert.deepEqual(
    getPaperWashes({ seed: 0.3, time: 42, ...size }),
    getPaperWashes({ seed: 0.3, time: 42, ...size })
  );
  assert.equal(
    getPaperWashes({ seed: 0.99, time: 0, ...size })[0].ink,
    PAPER_PALETTES.at(-1)?.edge
  );
});

test("holds a palette, then blends into the next one", () => {
  const inkAt = (time: number) =>
    getPaperWashes({ seed: 0, time, ...size })[1].ink;
  assert.equal(inkAt(100), PAPER_PALETTES[0].glow);
  assert.notEqual(inkAt(135), PAPER_PALETTES[0].glow);
  assert.notEqual(inkAt(135), PAPER_PALETTES[1].glow);
  assert.equal(inkAt(150), PAPER_PALETTES[1].glow);
});

test("washes drift slowly and stay near their places", () => {
  const a = getPaperWashes({ seed: 0.5, time: 10, ...size });
  const b = getPaperWashes({ seed: 0.5, time: 10.25, ...size });
  a.forEach((wash, index) => {
    assert.ok(Math.hypot(wash.x - b[index].x, wash.y - b[index].y) < 2);
  });
  for (let time = 0; time < 200; time += 7) {
    const [edge] = getPaperWashes({ seed: 0.5, time, ...size });
    assert.ok(edge.x > 400 && edge.x < 600 && edge.y > 200 && edge.y < 330);
  }
});

test("a time before zero still picks a palette", () => {
  for (const wash of getPaperWashes({ seed: 0, time: -0.01, ...size }))
    assert.match(wash.ink, /^#[0-9a-f]{6}$/);
});
