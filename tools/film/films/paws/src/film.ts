import type { CatLook } from "@/lib/paws/cat-look";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { createSceneResources, type SceneResources } from "@/lib/paws/render/create-scene-resources";
import type { WorldView } from "@/lib/paws/render/render-types";
import { RISO } from "@/lib/paws/riso-inks";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import type { deriveCat } from "@/lib/paws/sim/derive-cat";

import { COPY } from "./copy";
import { skyAt } from "./sky";
import { drawEndCard } from "./end-card";
import { mix, ramp, smooth, spring, SPRINGS, track } from "../../../engine/src/motion";
import { type CameraKey, cameraOn, catPoint, drawRoom, frameOf, type Point } from "./room";
import { runTake, type TakeFrame, type TakeResult } from "./run-take";
import { drawStudio, type StudioState, studioLayout } from "./studio";
import { NEW_LOOK, START_LOOK, TAKES } from "./takes";
import { drawCaption } from "./type";
import { bubble, center, pointer, strokeBox, type Ui } from "./ui";

const FORMATS: { [name: string]: [number, number] } = { "16:9": [1920, 1080], "9:16": [1080, 1920], "3:4": [1080, 1440], "1:1": [1080, 1080] };
const params = new URLSearchParams(location.search);
const [W, H] = FORMATS[params.get("format") ?? "16:9"] ?? [1920, 1080];
const PORTRAIT = H > W;
const UNIT = Math.min(W, H) / 1080;
const FPS = 60;
const BPM = 129.98;
const BEAT = 60 / BPM;
const FIRST_BEAT = 0.067;
/** Film time of the downbeat of bar `n`, counting from 1. */
const bar = (n: number) => FIRST_BEAT + (n - 1) * 4 * BEAT;
const DUR = Number(params.get("dur") ?? 62.4);

const T = {
  studioIn: bar(17),
  voiceIn: bar(20) + 2 * BEAT,
  studioOut: bar(23),
  langs: bar(25),
  end: bar(29),
};

const canvas = document.getElementById("film") as HTMLCanvasElement;
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext("2d")!;
const UI: Ui = { g: ctx, k: 2 * UNIT };
const TALK: Ui = { g: ctx, k: 2.6 * UNIT };

const makeCanvas = ({ width, height }: { width: number; height: number }) => {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
};
const roomResources = createSceneResources({ createCanvas: makeCanvas, paperSeed: 0.18 });
const studioResources = createSceneResources({ createCanvas: makeCanvas, paperSeed: 0.62 });
const grain = ctx.createPattern(roomResources.grain as HTMLCanvasElement, "repeat") ?? undefined;
const clamp = (x: number) => Math.min(1, Math.max(0, x));

const CUES: { t: number; sfx: string; gain?: number; pan?: number; text?: string }[] = [];

// ---------------------------------------------------------------- studio script

type Click = { at: number; target: string };
const CLICKS: Click[] = [
  { at: bar(18), target: "shuffle" },
  { at: bar(18) + 2 * BEAT, target: "coat:charcoal" },
  { at: bar(18) + 3 * BEAT, target: "coat:blueGrey" },
  { at: bar(19), target: "tab:pattern" },
  { at: bar(19) + 1 * BEAT, target: "pattern:tuxedo" },
  { at: bar(19) + 2 * BEAT, target: "tab:pads" },
  { at: bar(19) + 3 * BEAT, target: "pads:mixed" },
  { at: bar(20) + 1.5 * BEAT, target: "next" },
  { at: bar(21), target: "age:kitten" },
  { at: bar(21) + 1 * BEAT, target: "voice:squeaky" },
  { at: bar(21) + 2 * BEAT, target: "mood:chatty" },
  { at: bar(22), target: "play" },
  { at: bar(22) + 2 * BEAT, target: "bring" },
];
const SHUFFLE_ROLLS = 6;
const SHUFFLE_ROLL_SECONDS = 0.07;
const shuffleRolls = (() => {
  const random = createSeededRandom({ seed: 404 });
  return Array.from({ length: SHUFFLE_ROLLS - 1 }, () => shuffleCatLook({ random }));
})();
const LAST_ROLL = { ...NEW_LOOK, coat: "cream", pattern: "solid", pads: "pink" } as const satisfies CatLook;

/** Every look the studio cat has, each from its film time on. */
const LOOK_CHANGES: [number, CatLook][] = (() => {
  const at = (target: string) => CLICKS.find((c) => c.target === target)!.at;
  const s = at("shuffle");
  return [
    [0, START_LOOK],
    ...shuffleRolls.map((look, i): [number, CatLook] => [s + (i + 1) * SHUFFLE_ROLL_SECONDS, look]),
    [s + SHUFFLE_ROLLS * SHUFFLE_ROLL_SECONDS, LAST_ROLL],
    [at("coat:charcoal"), { ...LAST_ROLL, coat: "charcoal" }],
    [at("coat:blueGrey"), { ...LAST_ROLL, coat: "blueGrey" }],
    [at("pattern:tuxedo"), { ...LAST_ROLL, coat: "blueGrey", pattern: "tuxedo" }],
    [at("pads:mixed"), NEW_LOOK],
  ];
})();
const lookAtFilm = (t: number) => LOOK_CHANGES.filter(([at]) => at <= t).at(-1)![1];

function studioState(t: number): StudioState {
  const done = CLICKS.filter((c) => c.at <= t);
  const last = done.at(-1);
  const press = last === undefined ? 0 : Math.max(0, 1 - Math.abs(t - last.at - 0.06) / 0.12);
  const pressed = last?.target;
  if (t < T.voiceIn) {
    const tab = (done.filter((c) => c.target.startsWith("tab:")).at(-1)?.target.slice(4) ?? "coat") as "coat" | "pattern" | "pads";
    return { kind: "maker", tab, look: lookAtFilm(t), pressed, press };
  }
  const pick = (name: string, fallback: string) => done.filter((c) => c.target.startsWith(`${name}:`)).at(-1)?.target.split(":")[1] ?? fallback;
  return { kind: "voice", age: pick("age", "adult"), voice: pick("voice", "soft"), mood: pick("mood", "sleepy"), busy: done.some((c) => c.target === "bring"), pressed, press };
}

const clickSound = (target: string) =>
  target === "shuffle" ? "ui:shuffle" : target === "next" ? "ui:stepNext" : target === "bring" ? "ui:bringIn" : "ui:optionPick";
for (const click of CLICKS) CUES.push({ t: click.at, sfx: clickSound(click.target), gain: 0.7 });
for (const [target, file] of [["age:kitten", "kitten-soft-sleepy"], ["voice:squeaky", "kitten-squeaky-sleepy"], ["mood:chatty", "kitten-squeaky-chatty"], ["play", "kitten-squeaky-chatty"]] as const)
  CUES.push({ t: CLICKS.find((c) => c.target === target)!.at + 0.08, sfx: `meow:${file}`, gain: 1 });

const STUDIO_START = T.studioIn - 2;
const STUDIO_TAKE = runTake({
  seed: 23,
  fps: 60,
  seconds: T.studioOut - STUDIO_START + 1,
  residents: [{ userId: "film-studio", look: START_LOOK, restyles: LOOK_CHANGES.map(([at, look]): [number, CatLook] => [Math.max(0, at - STUDIO_START), look]) }],
});

// ---------------------------------------------------------------- room

const takes: { [name: string]: TakeResult } = {};
function take(name: string) {
  takes[name] ??= runTake(TAKES[name]!);
  return takes[name]!;
}

/** Sim speed of the room take at film time `t`: slow motion for the opening close-up, then real time. */
const roomSpeed = (t: number) => mix(0.3, 1, smooth(ramp(4.0, 8.4, t)));
const ROOM_SIM_TABLE = (() => {
  const step = 1 / 600;
  const table = [0.8];
  for (let i = 1; i * step <= 70; i++) table.push(table[i - 1]! + roomSpeed((i - 0.5) * step) * step);
  return { step, table };
})();
const roomSimAt = (t: number) => ROOM_SIM_TABLE.table[Math.max(0, Math.round(t / ROOM_SIM_TABLE.step))] ?? 0;
const filmAtRoomSim = (sim: number) => {
  const i = ROOM_SIM_TABLE.table.findIndex((v) => v >= sim);
  return i < 0 ? Infinity : i * ROOM_SIM_TABLE.step;
};

/** Room zoom: most of the room at 16:9, its full height at 9:16. */
const ROOM_FIT = PORTRAIT ? H / 1000 : W / 1240;

const paw = (frame: TakeFrame) => catPoint(frame, "film-hero", 30, -20);
const body = (frame: TakeFrame) => catPoint(frame, "film-hero", 30, 0);
const meet = (frame: TakeFrame) => {
  const head = catPoint(frame, "film-hero", 60, 0);
  const finger = frame.fingers.find((f) => f.userId === "film-you-7");
  if (finger === undefined || finger.tip.visibility < 0.05) return body(frame);
  return { x: mix(head.x, finger.tip.x, 0.4), y: mix(head.y, finger.tip.y, 0.4) + 14 };
};
const roomCenter = () => ({ x: 800, y: PORTRAIT ? 520 : 470 });
const newcomer = (frame: TakeFrame) => {
  const cat = frame.snapshots.find((c) => c.userId === "film-new");
  if (cat === undefined) return roomCenter();
  return { x: mix(800, cat.x, PORTRAIT ? 0.85 : 0.5), y: mix(470, cat.y, PORTRAIT ? 0.6 : 0.62) };
};

const ROOM_CAMERA: CameraKey[] = [
  { at: 0, target: () => ({ x: 271, y: 547 }), zoom: 19 },
  { at: 3.0, target: () => ({ x: 271, y: 547 }), zoom: 17.5 },
  { at: 4.8, target: paw, zoom: 12 },
  { at: bar(4) + 2 * BEAT, target: body, zoom: 4.6 },
  { at: bar(6), target: meet, zoom: 3.6 },
  { at: bar(8), target: meet, zoom: 4.3 },
  { at: bar(9), target: meet, zoom: 4.45 },
  { at: bar(10) + 2 * BEAT, target: roomCenter, zoom: ROOM_FIT },
  { at: bar(17), target: roomCenter, zoom: ROOM_FIT * 1.06 },
  { at: T.studioOut, target: roomCenter, zoom: ROOM_FIT * 1.06 },
  { at: T.studioOut + 2.2, target: newcomer, zoom: ROOM_FIT * 1.18 },
  { at: T.langs + 4 * BEAT, target: roomCenter, zoom: ROOM_FIT * 1.02 },
  { at: DUR, target: roomCenter, zoom: ROOM_FIT * 1.08 },
];

// ---------------------------------------------------------------- talk

type Line = { at: number; userId: string; text: string; accent: string; typed?: boolean; hold?: number };
const ACCENTS = [RISO.pink, RISO.blue, RISO.orange, RISO.yellow];
const SPEAKERS = ["film-calico", "film-ink", "film-hero", "film-cream", "film-new"];
const END_CARD_BOTTOM = H / W < 1.5 ? (80 + 780) * UNIT : (170 + 1100) * UNIT;
const LINES: Line[] = [
  { at: bar(11), userId: "film-cream", text: COPY.lines[1]!, accent: RISO.blue, hold: 3.2 },
  { at: bar(14) + 2 * BEAT, userId: "film-calico", text: COPY.lines[17]!, accent: RISO.orange, hold: 2.6 },
  { at: T.studioOut + 2.4, userId: "film-new", text: COPY.film.newcomerHello, accent: RISO.pink, typed: true, hold: 3 },
  { at: bar(30), userId: "film-hero", text: COPY.lines[0]!, accent: RISO.pink, hold: 2 },
  { at: 56.0, userId: "film-new", text: COPY.film.newcomerBye, accent: RISO.blue, hold: 1.7 },
  ...COPY.hellos.map((text, i) => ({ at: T.langs + 0.25 + i * BEAT, userId: SPEAKERS[i % SPEAKERS.length]!, text, accent: ACCENTS[i % ACCENTS.length]!, hold: 1.6 })),
];
for (const line of LINES) {
  CUES.push({ t: line.at, sfx: line.typed ? "ui:chatSend" : "ui:chatOpen", gain: 0.45 });
  CUES.push({ t: line.at + 0.12, sfx: `say:${line.userId}`, text: line.text, gain: line.typed ? 1 : 0.8 });
}

function drawTalk(t: number, cats: ReturnType<typeof deriveCat>[], view: WorldView) {
  const byUser = Object.fromEntries(cats.map((c) => [c.userId, c]));
  const shown = new Set<string>();
  for (const line of LINES.toReversed()) {
    const end = line.at + (line.hold ?? 2.5);
    if (t < line.at || t > end + 0.3 || shown.has(line.userId)) continue;
    const cat = byUser[line.userId];
    if (cat === undefined) continue;
    shown.add(line.userId);
    const x = view.offsetX + cat.head[0] * view.scale;
    const headY = view.offsetY + cat.head[1] * view.scale;
    if (t > T.end - 0.2 && (PORTRAIT ? headY < END_CARD_BOTTOM + 140 * UNIT : x < 1080 * UNIT)) continue;
    const y = Math.min(PORTRAIT ? H * 0.72 : H - 170 * UNIT, view.offsetY + (cat.head[1] - 46) * view.scale);
    const scale = spring(t - line.at, SPRINGS.pop) * (1 - smooth((t - end) / 0.3));
    const reveal = line.typed ? clamp((t - line.at - 0.3) / (BEAT * 0.5 * [...line.text].length)) : 1;
    bubble(TALK, { x: Math.min(W - 220 * UNIT, Math.max(220 * UNIT, x)), y: Math.max((PORTRAIT && t > T.langs ? 420 : 150) * UNIT, y), text: line.text, accent: line.accent, scale, reveal });
  }
}

// ---------------------------------------------------------------- captions

const CAPTIONS: { text: string; from: number; to: number; size: "line" | "title"; y?: number }[] = [
  { text: COPY.film.captions[0]!, from: bar(5) + 2 * BEAT, to: bar(8) + 2 * BEAT, size: "line" },
  { text: COPY.film.captions[1]!, from: bar(10), to: bar(12) + 2 * BEAT, size: "line" },
  { text: COPY.film.captions[2]!, from: bar(14), to: bar(16) + 2 * BEAT, size: "line" },
  { text: COPY.film.captions[3]!, from: T.studioOut + 3 * BEAT, to: bar(24) + 3 * BEAT, size: "line", y: (PORTRAIT ? 300 : 150) * UNIT },
  { text: COPY.film.captions[4]!, from: T.langs + 4 * BEAT, to: bar(28) + 2 * BEAT, size: "line", y: PORTRAIT ? 300 * UNIT : undefined },
];

// ---------------------------------------------------------------- studio scene

const LAYOUT = studioLayout({ W, H, k: UI.k });
const cursorTargets = (() => {
  const scratch = document.createElement("canvas").getContext("2d")!;
  const ui = { g: scratch, k: UI.k };
  return CLICKS.map((click) => {
    const state = studioState(click.at - 0.001);
    const targets = drawStudio(ui, { layout: LAYOUT, state, rise: { title: 1, dock: 1 }, grain: undefined });
    const box = targets[click.target];
    return { at: click.at, point: box ? center(box) : { x: W / 2, y: H / 2 } };
  });
})();

function cursorAt(t: number) {
  const keys = cursorTargets.map((c, i): [number, Point] => [c.at - (i === 0 ? 0.6 : 0.3), c.point]);
  const x = track(t, W * 0.72, keys.map(([at, p]): [number, number] => [at, p.x]), SPRINGS.default);
  const y = track(t, H * 0.95, keys.map(([at, p]): [number, number] => [at, p.y + 4 * UI.k]), SPRINGS.default);
  return { x, y };
}

const studioCanvas = document.createElement("canvas");
studioCanvas.width = Math.round(LAYOUT.square.w);
studioCanvas.height = Math.round(LAYOUT.square.h);
const studioCtx = studioCanvas.getContext("2d")!;
const STUDIO_RISE = { omega: 14, zeta: 0.75 };

function studioFollow(t: number) {
  const index = Math.round((t - STUDIO_START) * 60);
  const span = STUDIO_TAKE.frames.slice(Math.max(0, index - 50), index + 1).flatMap((f) => f.snapshots.slice(0, 1));
  if (span.length === 0) return { x: 800, y: 500 };
  return { x: span.reduce((a, s) => a + s.x, 0) / span.length, y: span.reduce((a, s) => a + s.y, 0) / span.length };
}

function drawStudioScene(t: number) {
  const out = smooth((t - T.studioOut) / 0.45);
  const veil = spring(t - T.studioIn, SPRINGS.heavy) * (1 - out);
  const wipe = spring(t - T.studioIn, { omega: 7, zeta: 1 });
  const edge = wipe * (W + 260 * UNIT) - 130 * UNIT;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, Math.max(0, edge), H);
  ctx.clip();
  ctx.fillStyle = `rgba(243,239,228,${0.86 * veil})`;
  ctx.fillRect(0, 0, W, H);

  const enterAt = t < T.voiceIn ? T.studioIn + 0.25 : T.voiceIn;
  const rise = { title: spring(t - enterAt - 0.06, STUDIO_RISE) * (1 - out), dock: spring(t - enterAt - 0.2, STUDIO_RISE) * (1 - out) };
  const catRise = spring(t - T.studioIn - 0.37, STUDIO_RISE) * (1 - out);
  const changeAt = LOOK_CHANGES.filter(([at]) => at <= t && at > 0).at(-1)?.[0];
  const bounce = changeAt === undefined ? 1 : 1 + 0.05 * Math.sin(Math.PI * clamp((t - changeAt) / 0.32));

  const side = LAYOUT.square.w;
  const follow = studioFollow(t);
  drawRoom({ g: studioCtx, width: side, height: side, take: STUDIO_TAKE, simTime: t - STUDIO_START, camera: { x: follow.x, y: follow.y, zoom: side / 300 }, resources: studioResources });
  const sq = LAYOUT.square;
  const c = center(sq);
  ctx.save();
  ctx.globalAlpha = clamp(catRise * 1.4);
  ctx.translate(c.x, c.y + (1 - catRise) * 48 * UI.k);
  ctx.scale(bounce, bounce);
  ctx.drawImage(studioCanvas, -sq.w / 2, -sq.h / 2, sq.w, sq.h);
  strokeBox(UI, { x: -sq.w / 2, y: -sq.h / 2, w: sq.w, h: sq.h });
  ctx.restore();

  drawStudio(UI, { layout: LAYOUT, state: studioState(t), rise, grain });
  const cursor = cursorAt(t);
  const lastClick = CLICKS.filter((click) => click.at <= t).at(-1);
  const press = lastClick ? Math.max(0, 1 - Math.abs(t - lastClick.at - 0.05) / 0.1) : 0;
  pointer(UI, { x: cursor.x, y: cursor.y, press, alpha: clamp((t - T.studioIn - 0.6) / 0.2) * (1 - out) });
  ctx.restore();

  if (wipe < 0.999) {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const band = 150 * UNIT;
    const gradient = ctx.createLinearGradient(edge - band, 0, edge + 20 * UNIT, 0);
    gradient.addColorStop(0, "rgba(255,208,58,0)");
    gradient.addColorStop(0.7, "rgba(255,208,58,0.85)");
    gradient.addColorStop(1, "rgba(255,208,58,0.95)");
    ctx.fillStyle = gradient;
    ctx.fillRect(edge - band, 0, band + 20 * UNIT, H);
    ctx.fillStyle = "rgba(217,87,127,0.55)";
    ctx.fillRect(edge + 14 * UNIT, 0, 5 * UNIT, H);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- end card

const pawIcon = new Image();
pawIcon.src = "assets/paw-icon.svg";

CUES.push({ t: T.end + 0.5, sfx: "ui:catJoins", gain: 0.6 });

// ---------------------------------------------------------------- sky

/** The hour of the room's summer day by film time: a late afternoon that turns to night by the end card. */
const SKY_HOURS: [number, number][] = [[0, 15.6], [bar(10), 16.2], [T.studioIn, 17.0], [T.studioOut, 18.5], [T.langs, 19.3], [T.end, 20.5], [99, 21.2]];
function skyAtFilm(t: number) {
  const next = SKY_HOURS.findIndex(([at]) => at > t);
  const [a, ha] = SKY_HOURS[next - 1]!;
  const [b, hb] = SKY_HOURS[next]!;
  return skyAt({ hour: mix(ha, hb, smooth((t - a) / (b - a))), season: "summer" });
}

// ---------------------------------------------------------------- seek

function seek(t: number) {
  const room = take("room");
  const simTime = roomSimAt(t);
  const camera = cameraOn(ROOM_CAMERA, t, frameOf(room, simTime));
  const sky = skyAtFilm(t);
  const { cats, view } = drawRoom({ g: ctx, width: W, height: H, take: room, simTime, camera, resources: roomResources, sky });
  if (t >= T.studioIn - 0.05 && t < T.studioOut + 0.6) drawStudioScene(t);
  if (t < T.studioIn || t > T.studioOut) drawTalk(t, cats, view);
  drawEndCard({ ui: UI, W, H, u: t - T.end, grain, pawIcon });
  for (const caption of CAPTIONS) drawCaption({ g: ctx, W, H, t, night: sky.lamp, ...caption });
  const fade = smooth((t - (DUR - 0.6)) / 0.6);
  if (fade > 0) {
    ctx.fillStyle = `rgba(243,239,228,${fade})`;
    ctx.fillRect(0, 0, W, H);
  }
}

function collectRoomCues() {
  const room = take("room");
  let lastPat = -1;
  for (const frame of room.frames) {
    const t = filmAtRoomSim(frame.time);
    if (t > DUR) break;
    const hidden = t > T.studioIn + 0.4 && t < T.studioOut;
    for (const event of frame.events) {
      if (event.kind === "sound" && !hidden) CUES.push({ t, sfx: `cat:${event.userId}:${event.sound}`, gain: event.sound === "purr" ? 0.5 : 0.9 });
      if (event.kind === "pawPrint" && t < bar(9) && t - lastPat > 0.12) {
        CUES.push({ t, sfx: "pat", gain: t < 4.4 ? 0.6 : 0.25 });
        lastPat = t;
      }
      if (event.kind === "fingerPrint" && !hidden) CUES.push({ t, sfx: "ui:optionPick", gain: 0.35 });
    }
  }
  CUES.push({ t: filmAtRoomSim(37.25) + 0.1, sfx: "ui:catJoins", gain: 0.6 });
}

Promise.all([
  document.fonts.load('500 40px "Plex Mono"'),
  document.fonts.load('40px "Plex Mono"'),
  document.fonts.load('40px "Geist Serif"'),
  new Promise((resolve) => {
    pawIcon.onload = resolve;
    pawIcon.onerror = resolve;
  }),
  document.fonts.ready,
]).then(() => {
  take("room");
  collectRoomCues();
  CUES.sort((a, b) => a.t - b.t);
  Object.assign(window, { seek, DUR, FPS, BPM, W, H, LOOP: false, CUES, ready: true });
  if (!params.has("render")) {
    const start = performance.now();
    const play = () => {
      seek(((performance.now() - start) / 1000) % DUR);
      requestAnimationFrame(play);
    };
    play();
  }
});
