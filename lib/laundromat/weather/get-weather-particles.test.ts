import assert from "node:assert/strict";
import { test } from "node:test";

import { getWeatherParticles } from "./get-weather-particles";

test("returns the same points in the unit square for the same seed", () => {
  const particles = getWeatherParticles({ count: 40, seed: 7 });
  assert.equal(particles.length, 40);
  assert.deepEqual(particles, getWeatherParticles({ count: 40, seed: 7 }));
  particles.forEach((particle) =>
    [particle.across, particle.up, particle.size].forEach((value) =>
      assert.ok(value >= 0 && value < 1)
    )
  );
});

test("scatters different points for different seeds", () => {
  assert.notDeepEqual(
    getWeatherParticles({ count: 5, seed: 1 }),
    getWeatherParticles({ count: 5, seed: 2 })
  );
});
