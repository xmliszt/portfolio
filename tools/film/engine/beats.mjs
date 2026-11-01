// node engine/beats.mjs track.mp3 [--min=70 --max=180]
// Prints the track's tempo, the time of its first beat, and its strongest onsets, for cutting picture to a supplied song.
import { execFileSync } from 'node:child_process';

const [file, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(rest.map(a => { const [key, value] = a.replace(/^--/, '').split('='); return [key, value]; }));
const SR = 11_025, HOP = 128;
const pcm = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { maxBuffer: 1 << 30 });
const samples = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length / 4);

const energy = Array.from({ length: Math.floor(samples.length / HOP) }, (_, f) => {
  let sum = 0;
  for (let i = f * HOP; i < (f + 1) * HOP; i++) sum += samples[i] * samples[i];
  return Math.log1p(1000 * sum);
});
const flux = energy.map((e, f) => Math.max(0, e - (energy[f - 1] ?? e)));
const frameSec = HOP / SR;

const lagScore = lag => flux.reduce((s, v, f) => s + v * (flux[f + lag] ?? 0), 0);
const lags = Array.from({ length: 400 }, (_, i) => i + 1).filter(lag => {
  const bpm = 60 / (lag * frameSec);
  return bpm >= Number(args.min ?? 70) && bpm <= Number(args.max ?? 180);
});
const bestLag = lags.reduce((best, lag) => (lagScore(lag) > lagScore(best) ? lag : best));

const coarseBpm = 60 / (bestLag * frameSec);

// Whole-frame lags are ~2.5% apart near 120 BPM, so refine the period to about 0.02 BPM and fit the phase to it.
const combScore = (period, phase) => {
  let sum = 0;
  for (let f = phase; f < flux.length; f += period) sum += Math.max(flux[Math.round(f) - 1] ?? 0, flux[Math.round(f)] ?? 0, flux[Math.round(f) + 1] ?? 0);
  return sum;
};
const candidates = Array.from({ length: 401 }, (_, i) => coarseBpm * 0.96 + (i * coarseBpm * 0.08) / 400).flatMap(bpmTry => {
  const period = 60 / bpmTry / frameSec;
  return Array.from({ length: Math.ceil(period * 4) }, (_, k) => ({ bpm: bpmTry, period, phase: k / 4 }));
});
const best = candidates.reduce((top, c) => {
  const score = combScore(c.period, c.phase);
  return score > top.score ? { ...c, score } : top;
}, { score: -1 });
const bpm = best.bpm, phase = best.phase;

const mean = flux.reduce((s, v) => s + v, 0) / flux.length;
const sd = Math.sqrt(flux.reduce((s, v) => s + (v - mean) ** 2, 0) / flux.length);
const onsets = flux
  .map((v, f) => ({ t: f * frameSec, v }))
  .filter(({ v }, f) => v > mean + 2.5 * sd && v >= (flux[f - 1] ?? 0) && v >= (flux[f + 1] ?? 0))
  .map(({ t }) => Number(t.toFixed(3)));

console.log(JSON.stringify({ bpm: Number(bpm.toFixed(2)), firstBeat: Number((phase * frameSec).toFixed(3)), onsets }, null, 2));
