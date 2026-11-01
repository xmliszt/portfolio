// The film build swaps the room's six-step soft edge for a dense one with the same falloff,
// so blurred edges stay smooth when the camera zooms far past the app's scale.
import { readFileSync } from 'node:fs';

const ORIGINAL = [[1.5, 0.07], [1.1, 0.09], [0.75, 0.13], [0.45, 0.2], [0.15, 0.32], [-0.2, 1]];
function densePasses(steps) {
  let cover = 0;
  const knots = ORIGINAL.map(([extra, a]) => { cover = 1 - (1 - cover) * (1 - a); return [extra, cover]; });
  const coverAt = (e) => {
    if (e >= knots[0][0]) return knots[0][1] * Math.max(0, 1 - (e - knots[0][0]) / 0.4);
    for (let i = 1; i < knots.length; i++) {
      const [e0, c0] = knots[i - 1], [e1, c1] = knots[i];
      if (e >= e1) { const u = (e0 - e) / (e0 - e1); const s = u * u * (3 - 2 * u); return c0 + (c1 - c0) * s; }
    }
    return 1;
  };
  const passes = [];
  let prev = 0;
  for (let j = 0; j < steps; j++) {
    const e = 1.9 - (j / (steps - 1)) * (1.9 - -0.2);
    const c = j === steps - 1 ? 1 : coverAt(e);
    const a = prev >= 1 ? 1 : 1 - (1 - c) / (1 - prev);
    passes.push([Number(e.toFixed(4)), Number(Math.max(0, a).toFixed(5))]);
    prev = c;
  }
  return passes;
}

const filmQuality = {
  name: 'film-quality',
  setup(b) {
    b.onLoad({ filter: /lib\/paws\/render\/soft-capsule\.ts$/ }, (args) => {
      const source = readFileSync(args.path, 'utf8');
      const replaced = source.replace(/export const SOFT_PASSES = \[[\s\S]*?\] as const;/, `export const SOFT_PASSES = ${JSON.stringify(densePasses(28))} as const;`);
      if (replaced === source) throw new Error('SOFT_PASSES not found in soft-capsule.ts');
      return { contents: replaced, loader: 'ts' };
    });
  },
};

export const entries = [
  { entry: 'src/probe.ts', outfile: 'out/probe.cjs', platform: 'node' },
  { entry: 'src/mix.ts', outfile: 'out/mix.js' },
  { entry: 'src/film.ts', outfile: 'out/film.js', plugins: [filmQuality] },
  { entry: 'src/features.ts', outfile: 'out/features.js', plugins: [filmQuality] },
];
