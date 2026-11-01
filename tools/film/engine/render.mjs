// node engine/render.mjs --film=films/paws [--format=16:9|9:16|3:4|1:1] [--page=index.html] [--q=lang=zh]
//   --out=out/film.mp4 [--audio=out/score.wav] [--range=a:b]   video (default)
//   --stills=0.5,2,4.25                                         full-size PNGs in out/stills/
//   --sheet=12                                                  contact sheet of 12 evenly spaced frames
//   --strip=1.8:2.4                                             contact sheet of every frame in a range
//   --verify                                                    seek out of order and compare pixels
// Paths are relative to the film folder. Every run writes out/timeline.json (DUR, FPS, BPM, CUES) for the score.
import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [key, ...rest] = a.replace(/^--/, '').split('=');
  return [key, rest.length ? rest.join('=') : 'true'];
}));
process.chdir(resolve(args.film ?? '.'));
const format = args.format ?? '16:9';
const tag = format.replace(':', 'x');

function run(cmd, cmdArgs, input) {
  return new Promise((ok, fail) => {
    const child = spawn(cmd, cmdArgs, { stdio: [input ? 'pipe' : 'ignore', 'inherit', 'inherit'] });
    child.on('close', code => (code === 0 ? ok() : fail(new Error(`${cmd} exited ${code}`))));
    if (input) input(child.stdin);
  });
}

const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1; });
page.on('console', m => { if (m.type() === 'error') console.error('page console:', m.text()); });
await page.goto(`${pathToFileURL(resolve(args.page ?? 'index.html')).href}?render&format=${encodeURIComponent(format)}${args.q ? '&' + args.q : ''}`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 60_000 });
const film = await page.evaluate(() => ({ DUR, FPS, W, H, BPM: window.BPM, LOOP: window.LOOP ?? false, CUES: window.CUES ?? [] }));
await page.setViewportSize({ width: film.W, height: film.H });
mkdirSync('out', { recursive: true });
writeFileSync('out/timeline.json', JSON.stringify(film, null, 2));

async function frameAt(t, type = 'jpeg', attempt = 1) {
  await page.evaluate(time => window.seek(time), t);
  try {
    return await page.screenshot(type === 'jpeg' ? { type, quality: 95 } : { type });
  } catch (error) {
    if (attempt >= 3) throw error;
    console.error(`screenshot at ${t} failed, retrying: ${error.message.split('\n')[0]}`);
    return frameAt(t, type, attempt + 1);
  }
}
const frameTimes = (a, b) => Array.from({ length: Math.round((b - a) * film.FPS) }, (_, i) => a + i / film.FPS);

async function contactSheet(times, out) {
  const dir = `out/.sheet-${process.pid}`;
  mkdirSync(dir, { recursive: true });
  for (const [i, t] of times.entries()) writeFileSync(`${dir}/${String(i).padStart(4, '0')}.png`, await frameAt(t, 'png'));
  const cols = Math.min(6, times.length);
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', `${dir}/%04d.png`,
    '-vf', `scale=480:-2,tile=${cols}x${Math.ceil(times.length / cols)}:padding=8:color=white`, '-frames:v', '1', out]);
  rmSync(dir, { recursive: true });
  console.log(`${out}  times: ${times.map(t => t.toFixed(3)).join(' ')}`);
}

if (args.stills) {
  mkdirSync('out/stills', { recursive: true });
  for (const t of args.stills.split(',').map(Number)) {
    const file = `out/stills/${tag}-t${t.toFixed(2)}.png`;
    writeFileSync(file, await frameAt(t, 'png'));
    console.log(file);
  }
} else if (args.sheet) {
  const n = Number(args.sheet);
  await contactSheet(Array.from({ length: n }, (_, i) => (i * film.DUR) / n), args.out ?? `out/sheet-${tag}.jpg`);
} else if (args.strip) {
  const [a, b] = args.strip.split(':').map(Number);
  await contactSheet(frameTimes(a, b), args.out ?? `out/strip-${tag}.jpg`);
} else if (args.verify) {
  const times = [0.37, film.DUR * 0.5, film.DUR * 0.9, 0.11, film.DUR * 0.25].map(t => Math.min(t, film.DUR - 1 / film.FPS));
  const forward = [];
  for (const t of times) forward.push(await frameAt(t, 'png'));
  const mismatched = [];
  for (const [i, t] of [...times.entries()].toReversed()) if (!(await frameAt(t, 'png')).equals(forward[i])) mismatched.push(t);
  if (film.LOOP) {
    writeFileSync('out/loop-first.png', await frameAt(0, 'png'));
    writeFileSync('out/loop-last.png', await frameAt(film.DUR, 'png'));
    const { stderr } = spawnSync('ffmpeg', ['-i', 'out/loop-first.png', '-i', 'out/loop-last.png', '-lavfi', 'psnr', '-f', 'null', '-'], { encoding: 'utf8' });
    const average = Number(/average:(\S+)/.exec(stderr)?.[1]?.replace('inf', 'Infinity') ?? 'NaN');
    // Springs approach their target without reaching it, so the loop seam is compared by PSNR, not bytes.
    if (!(average === Infinity || average > 45)) mismatched.push(`loop: seek(0) vs seek(DUR) PSNR ${average} dB (want > 45)`);
  }
  console.log(mismatched.length ? `NOT deterministic at: ${mismatched.join(', ')}` : `deterministic (${times.length} frames, both orders${film.LOOP ? ', loop closes' : ''})`);
  if (mismatched.length) process.exitCode = 1;
} else {
  const [a, b] = args.range ? args.range.split(':').map(Number) : [0, film.DUR];
  const out = args.out ?? `out/film-${tag}.mp4`;
  const audio = args.audio ? ['-ss', String(a), '-t', String(b - a), '-i', args.audio, '-map', '0:v', '-map', '1:a',
    '-af', 'loudnorm=I=-16:TP=-1.5', '-ar', '48000', '-c:a', 'aac', '-b:a', '192k', '-shortest'] : [];
  const times = frameTimes(a, b);
  const started = Date.now();
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(film.FPS), '-c:v', 'mjpeg', '-i', '-',
    ...audio, '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], async stdin => {
    for (const [i, t] of times.entries()) {
      if (!stdin.write(await frameAt(t))) await new Promise(r => stdin.once('drain', r));
      if (i % film.FPS === 0) console.log(`frame ${i + 1}/${times.length}  ${((Date.now() - started) / (i + 1)).toFixed(0)} ms/frame`);
    }
    stdin.end();
  });
  console.log(`wrote ${out} (${times.length} frames)`);
}
await browser.close();
