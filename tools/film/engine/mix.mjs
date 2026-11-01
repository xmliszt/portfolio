// node engine/mix.mjs --film=films/paws
// Render <film>/out/mix.wav from <film>/out/timeline.json (written by render.mjs) in headless Chromium.
// The film's out/mix.js must set window.mix({ cues, seconds, fadeOutAt }) to return the WAV as base64.
// The page serves the film folder at /film/ and the repo's public/ at /.
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const filmArg = process.argv.find(a => a.startsWith('--film='))?.slice('--film='.length) ?? '.';
process.chdir(resolve(filmArg));
const film = JSON.parse(readFileSync('out/timeline.json', 'utf8'));
const roots = { '/film/': resolve('.'), '/': fileURLToPath(new URL('../../../public', import.meta.url)) };
const types = { '.js': 'text/javascript', '.mp3': 'audio/mpeg', '.html': 'text/html' };
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/mix.html') {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<!doctype html><meta charset="utf-8"><script src="/film/out/mix.js"></script>');
    return;
  }
  const prefix = Object.keys(roots).find((p) => url.startsWith(p));
  const file = prefix ? join(roots[prefix], url.slice(prefix.length)) : '';
  if (!prefix || !existsSync(file)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  res.end(readFileSync(file));
}).listen(0);
const port = server.address().port;
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => console.error('page error:', e.message));
await page.goto(`http://localhost:${port}/mix.html`);
const base64 = await page.evaluate((options) => window.mix(options), { cues: film.CUES, seconds: film.DUR, fadeOutAt: film.DUR - 2.2 });
writeFileSync('out/mix.wav', Buffer.from(base64, 'base64'));
console.log(`wrote out/mix.wav (${film.DUR.toFixed(2)} s, ${film.CUES.length} cues)`);
await browser.close();
server.close();
