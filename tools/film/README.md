# Film

Renders motion films to MP4 from code. A film is a web page that draws frame `t` on a canvas when the renderer calls `seek(t)`. Headless Chromium (Playwright) screenshots each frame, ffmpeg encodes them, and the sound is mixed offline in Chromium from a cue list the film exports.

- `engine/`: shared by every film.
  - `render.mjs`: stills, contact sheets, frame strips, video ranges, and the determinism check.
  - `render-all.sh`: build, check, mix, render in parallel ranges, join, and mux the sound.
  - `mix.mjs`, `src/render-mix.ts`: the offline mixer (music bed, fade-out, WAV output).
  - `build.mjs`: esbuild bundler with `@/` resolved against the repo, so films can draw with the app's real code.
  - `beats.mjs`: tempo, first beat and strong onsets of a track, for cutting picture to music.
  - `src/motion.ts`: springs, easing and a seeded random.
- `films/<name>/`: one film. `films/paws/` holds the Paws promo (`index.html`) and features film (`features.html`).

## Setup

```sh
cd tools/film
npm install
npx playwright install chromium
```

ffmpeg and ffprobe must be on the path.

## Render

Run from `tools/film`. Outputs go to `films/<name>/out/` (gitignored).

```sh
./engine/render-all.sh films/paws 16:9 paws-promo-16x9
./engine/render-all.sh films/paws 9:16 paws-promo-9x16
./engine/render-all.sh films/paws 3:4 paws-promo-3x4-zh lang=zh
./engine/render-all.sh films/paws 1:1 paws-promo-1x1
./engine/render-all.sh films/paws 16:9 paws-features-16x9 "" features.html   # 16:9 only; add lang=zh for Chinese
PARTS=2 ./engine/render-all.sh films/paws 16:9 smoke "dur=4"                 # 4 s smoke test
```

Arguments: film folder, format, output name, page query, page. `PARTS` sets the number of parallel ranges (default 4).

Checking frames without a full render (build first with `node engine/build.mjs --film=films/paws`):

```sh
node engine/render.mjs --film=films/paws --format=3:4 --q=lang=zh --sheet=12   # contact sheet
node engine/render.mjs --film=films/paws --stills=19.5,55                      # full-size PNGs in out/stills/
node engine/render.mjs --film=films/paws --strip=1.8:2.4                       # every frame in a range
node engine/render.mjs --film=films/paws --verify                              # same pixels in both seek orders
```

## Music

Each film reads its track from `films/<name>/assets/music.mp3`, which is gitignored. The Paws track is the app's own; copy it from `public/paws/sounds/`: `cp ../../public/paws/sounds/music.mp3 films/paws/assets/`.

## A new film

1. Copy a film folder to `films/<name>/` and edit it.
2. The page sets `window.seek(t)`, then `window.ready = true` and `window.DUR`, `FPS`, `W`, `H`, `BPM`, `CUES` once fonts and assets are loaded. `seek(t)` must draw the same pixels for the same `t` whatever was drawn before. The page reads the format from `?format=`.
3. `build.config.mjs` exports `entries`: `{ entry, outfile, platform?, plugins? }`, bundled into `out/`. Pages load their bundle from `out/`.
4. For sound, bundle `out/mix.js` that sets `window.mix({ cues, seconds, fadeOutAt })` to return base64 WAV, usually by calling `renderMix` from `engine/src/render-mix.ts`. The mixer serves the film folder at `/film/` and the repo's `public/` at `/`.

Type-check: `../../node_modules/.bin/tsc --noEmit -p .`
