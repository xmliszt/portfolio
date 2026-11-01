# Paws films

The promo (`index.html`, 62.4 s, cut to "Yammy Flavor" at 129.98 BPM, first beat 0.067 s) and the features film (`features.html`, 112 s). Every room shot is the real Paws renderer (`lib/paws/render`) drawing the real cat simulation (`lib/paws/sim`), stepped from scripted takes. The studio is drawn to the app's own component sizes (`app/paws/_ui`). Sound is mixed from the app's own meows, purrs, letter babble and UI tones. `?lang=zh` switches captions, end card and studio to zh-Hans via `src/copy.ts`.

- `src/film.ts`: promo timeline (bars), cameras, studio script, captions, speech lines, end card, sound cues.
- `src/features.ts`, `src/features-takes.ts`: the features film and its takes.
- `src/takes.ts`, `src/run-take.ts`: cats, toys, fingers and directions per take, run once at load at `fps` steps per sim second. A take without `toys` has an empty room; `watch` runs after every step; `lead` overrides how much sim runs before a features scene appears.
- `src/room.ts`, `src/end-card.ts`, `src/sky.ts`, `src/tray.ts`: room camera and renderer call, end card, sky by hour (fixed date and latitude so renders repeat), toy tray.
- `src/studio.ts`, `src/ui.ts`, `src/type.ts`: studio layout, UI pieces, riso type.
- `src/mix.ts`: the cues mixed over the music.
- `build.config.mjs`: swaps the room's 6-step soft edge for a 28-step one so close-ups stay smooth.

Log a take's states, events, toys and box visits: `node films/paws/out/probe.cjs room`. Edits to `lib/paws` change the film on the next build.
