import { createSceneResources } from "@/lib/paws/render/create-scene-resources";
import type { WorldView } from "@/lib/paws/render/render-types";
import { RISO } from "@/lib/paws/riso-inks";
import type { deriveCat } from "@/lib/paws/sim/derive-cat";

import { COPY } from "./copy";
import { skyAt } from "./sky";
import { drawEndCard } from "./end-card";
import { BOX_POKE, FEATURE_TAKES, GRID_CENTER, LEAD, YARN_DROP } from "./features-takes";
import { mix, smooth, spring, SPRINGS, track } from "../../../engine/src/motion";
import { type CameraKey, cameraOn, catPoint, drawRoom, frameOf, type Point } from "./room";
import { runTake, type TakeFrame, type TakeResult } from "./run-take";
import { drawStudio, type StudioState, studioLayout } from "./studio";
import { drawToyIcon, drawTray } from "./tray";
import { NEW_LOOK } from "./takes";
import { drawCaption, MONO, riso, SERIF } from "./type";
import { bubble, buttonWidth, center, pointer, risoButton, strokeBox, type Ui } from "./ui";

const params = new URLSearchParams(location.search);
const W = 1920;
const H = 1080;
const UNIT = 1;
const FPS = 60;
const BPM = 129.98;
const BEAT = 60 / BPM;
/** Film time of the downbeat of bar `n`, counting from 1. */
const bar = (n: number) => 0.067 + (n - 1) * 4 * BEAT;

/** When each scene starts; each one runs until the next begins. */
const S = {
  grid: 0,
  voice: bar(6),
  talk: bar(9),
  finger: bar(14),
  shared: bar(24),
  social: bar(27),
  toys: bar(37),
  box: bar(42),
  bowl: bar(45),
  sky: bar(49),
  langs: bar(54),
  end: bar(58),
};
const DUR = Number(params.get("dur") ?? 112);
const WIPE_SECONDS = 0.7;

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
const resources = createSceneResources({ createCanvas: makeCanvas, paperSeed: 0.18 });
const studioResources = createSceneResources({ createCanvas: makeCanvas, paperSeed: 0.62 });
const grain = ctx.createPattern(resources.grain as HTMLCanvasElement, "repeat") ?? undefined;
const clamp = (x: number) => Math.min(1, Math.max(0, x));
const F = COPY.features;

const CUES: { t: number; sfx: string; gain?: number; pan?: number; text?: string }[] = [];

const takes: { [name: string]: TakeResult } = {};
const take = (name: string) => (takes[name] ??= runTake(FEATURE_TAKES[name]!));
const ROOM_FIT = W / 1240;

// ---------------------------------------------------------------- shared pieces

/** Draw a row of step chips centred at `y`: the step at `active` printed yellow, the rest quiet, each rising in on its own beat from `from`. */
function chipRow(options: { t: number; from: number; labels: string[]; active: number; y: number; joiner?: string; out: number }) {
  const { t, labels } = options;
  const widths = labels.map((label) => buttonWidth(TALK, label, 500));
  const gap = (options.joiner ? 54 : 22) * UNIT;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
  let x = (W - total) / 2;
  const h = 32 * TALK.k;
  labels.forEach((label, i) => {
    const enter = spring(t - options.from - i * 0.08, SPRINGS.pop) * (1 - smooth((t - options.out) / 0.3));
    if (enter > 0.01) {
      ctx.save();
      ctx.globalAlpha = clamp(enter * 1.5);
      ctx.translate(0, (1 - enter) * -30 * UNIT);
      risoButton(TALK, { box: { x, y: options.y - h / 2, w: widths[i]!, h }, label, variant: i === options.active ? "primary" : "quiet" });
      if (options.joiner && i < labels.length - 1) {
        ctx.font = `${32 * UNIT}px ${MONO}`;
        ctx.fillStyle = RISO.inkSoft;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(options.joiner, x + widths[i]! + gap / 2, options.y);
      }
      ctx.restore();
    }
    x += widths[i]! + gap;
  });
}

/** Stamp a big riso number with a mono label after it, bottom left, from `at` to `out`. */
function numberCard(options: { t: number; at: number; out: number; big: string; label: string; sub?: string; x: number; y: number; px?: number; stacked?: boolean }) {
  const stamp = spring(options.t - options.at, { omega: 20, zeta: 0.6 }) * (1 - smooth((options.t - options.out) / 0.35));
  if (stamp < 0.01) return;
  const px = (options.px ?? 160) * UNIT;
  ctx.save();
  ctx.globalAlpha = clamp(stamp * 2);
  ctx.translate(options.x, options.y);
  ctx.scale(mix(1.25, 1, stamp), mix(1.25, 1, stamp));
  ctx.font = `${px}px ${SERIF}`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  riso({ g: ctx, text: options.big, x: 0, y: 0, offset: 6 * UNIT, halo: 30 * UNIT });
  const bigW = ctx.measureText(options.big).width;
  const labelAt = options.stacked ? { x: 6 * UNIT, y: 62 * UNIT } : { x: bigW + 26 * UNIT, y: -px * 0.36 };
  ctx.font = `500 ${40 * UNIT}px ${MONO}`;
  ctx.fillStyle = RISO.ink;
  ctx.fillText(options.label, labelAt.x, labelAt.y);
  if (options.sub) {
    ctx.font = `${28 * UNIT}px ${MONO}`;
    ctx.fillStyle = RISO.inkSoft;
    options.sub.split("\n").forEach((line, i) => ctx.fillText(line, labelAt.x, labelAt.y + (48 + i * 38) * UNIT));
  }
  ctx.restore();
}

type Line = { at: number; userId: string; text: string; accent: string; typed?: boolean; hold?: number };

function drawLines(t: number, lines: Line[], cats: ReturnType<typeof deriveCat>[], view: WorldView) {
  const byUser = Object.fromEntries(cats.map((c) => [c.userId, c]));
  const shown = new Set<string>();
  for (const line of lines.toReversed()) {
    const end = line.at + (line.hold ?? 2.5);
    if (t < line.at || t > end + 0.3 || shown.has(line.userId)) continue;
    const cat = byUser[line.userId];
    if (cat === undefined) continue;
    shown.add(line.userId);
    const x = view.offsetX + cat.head[0] * view.scale;
    const y = Math.min(H - 190 * UNIT, view.offsetY + (cat.head[1] - 46) * view.scale);
    const scale = spring(t - line.at, SPRINGS.pop) * (1 - smooth((t - end) / 0.3));
    const reveal = line.typed ? clamp((t - line.at - 0.25) / (0.075 * [...line.text].length)) : 1;
    bubble(TALK, { x: Math.min(W - 220 * UNIT, Math.max(220 * UNIT, x)), y: Math.max(250 * UNIT, y), text: line.text, accent: line.accent, scale, reveal });
  }
}
function lineCues(lines: Line[]) {
  for (const line of lines) {
    CUES.push({ t: line.at, sfx: line.typed ? "ui:chatSend" : "ui:chatOpen", gain: 0.45 });
    CUES.push({ t: line.at + 0.12, sfx: `say:${line.userId}`, text: line.text, gain: line.typed ? 1 : 0.8 });
  }
}

const leadOf = (name: string) => FEATURE_TAKES[name]?.lead ?? LEAD;

/** Add the cat sounds, finger prints and paw pats of take `name` played from film time `start`, until `stop`. */
function takeCues(name: string, start: number, stop: number) {
  let lastPat = -1;
  for (const frame of take(name).frames) {
    const t = start + frame.time - leadOf(name);
    if (t < start || t > stop) continue;
    for (const event of frame.events) {
      if (event.kind === "sound") CUES.push({ t, sfx: `cat:${event.userId}:${event.sound}`, gain: event.sound === "purr" ? 0.5 : 0.9 });
      if (event.kind === "fingerPrint") CUES.push({ t, sfx: "ui:optionPick", gain: 0.35 });
      if (event.kind === "pawPrint" && name === "shared" && t - lastPat > 0.2) {
        CUES.push({ t, sfx: "pat", gain: 0.3 });
        lastPat = t;
      }
    }
  }
}

const catAt = (userId: string) => (frame: TakeFrame) => catPoint(frame, userId, 20, 0);
/** Aim between cats `a` and `b`, `toB` of the way toward `b`. */
const between = (a: string, b: string, toB = 0.5) => (frame: TakeFrame) => {
  const pa = catPoint(frame, a, 0, 0);
  const pb = catPoint(frame, b, 0, 0);
  return { x: mix(pa.x, pb.x, toB), y: mix(pa.y, pb.y, toB) };
};
const fixed = (p: Point) => () => p;
const toyAt = (toyId: string, fallback: Point) => (frame: TakeFrame) => frame.toys.find((t) => t.id === toyId) ?? fallback;

/** Hours of the time-lapse in the sky scene, by scene seconds: dawn, morning, noon, sunset, dusk, night. */
const SKY_HOURS: [number, number][] = [[0, 5.2], [1.4, 6.6], [3.0, 12.5], [5.0, 18.3], [6.4, 19.6], [7.8, 21.6], [99, 21.8]];
const NIGHT_HOUR = 21.8;

/** Return the room's sky at film time `t`: the paper's own light until the sky scene, the time-lapse through it, and a summer night after. */
function skyAtFilm(t: number) {
  if (t < S.sky) return undefined;
  if (t >= S.langs) return skyAt({ hour: NIGHT_HOUR, season: "summer" });
  const u = t - S.sky;
  const next = SKY_HOURS.findIndex(([at]) => at > u);
  const [a, ha] = SKY_HOURS[next - 1]!;
  const [b, hb] = SKY_HOURS[next]!;
  return skyAt({ hour: mix(ha, hb, smooth((u - a) / (b - a))), season: "summer" });
}

/** Draw take `name` at film time `t` for a scene that started at `start`, through `keys` given in scene seconds. */
function roomScene(name: string, start: number, t: number, keys: CameraKey[]) {
  const result = take(name);
  const simTime = t - start + leadOf(name);
  const camera = cameraOn(keys.map((k) => ({ ...k, at: k.at + start })), t, frameOf(result, simTime));
  return { ...drawRoom({ g: ctx, width: W, height: H, take: result, simTime, camera, resources, sky: skyAtFilm(t) }), camera };
}

// ---------------------------------------------------------------- 1. how many cats

const gridKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: GRID_CENTER.x, y: GRID_CENTER.y + 14 }), zoom: 1.58 },
  { at: S.voice - S.grid, target: fixed({ x: GRID_CENTER.x, y: GRID_CENTER.y + 14 }), zoom: 1.5 },
];
for (let beat = 1; beat < 18; beat++) CUES.push({ t: 0.067 + beat * BEAT, sfx: beat < 8 ? "ui:shuffle" : "ui:optionPick", gain: beat < 8 ? 0.32 : 0.28 });
CUES.push({ t: bar(3), sfx: "ui:catJoins", gain: 0.7 });

function drawGrid(t: number) {
  roomScene("grid", S.grid, t, gridKeys);
  const step = Math.floor((t - bar(3)) / (2 * BEAT));
  chipRow({ t, from: bar(3) - 0.15, labels: F.steps, active: Math.min(4, step), y: 92 * UNIT, joiner: "×", out: S.voice - 0.3 });
  numberCard({ t, at: bar(3), out: S.voice - 0.3, big: F.cats[0]!, label: F.cats[1]!, x: 520 * UNIT, y: 1030 * UNIT, px: 150 });
}

// ---------------------------------------------------------------- 2. voices

type Click = { at: number; target: string; meow: string };
const VOICE_CLICKS: Click[] = [
  { at: bar(6) + 2 * BEAT, target: "age:kitten", meow: "kitten-soft-sleepy" },
  { at: bar(7), target: "voice:squeaky", meow: "kitten-squeaky-sleepy" },
  { at: bar(7) + 2 * BEAT, target: "mood:chatty", meow: "kitten-squeaky-chatty" },
  { at: bar(8), target: "age:old", meow: "old-squeaky-chatty" },
  { at: bar(8) + 2 * BEAT, target: "play", meow: "old-squeaky-chatty" },
];
for (const click of VOICE_CLICKS) {
  CUES.push({ t: click.at, sfx: "ui:optionPick", gain: 0.6 });
  CUES.push({ t: click.at + 0.08, sfx: `meow:${click.meow}`, gain: 1 });
}
const LAYOUT = studioLayout({ W, H, k: UI.k });
const VOICE_START = S.voice - 1;
const VOICE_TAKE = runTake({ seed: 23, fps: 60, seconds: S.talk - VOICE_START + 1, residents: [{ userId: "voice-cat", look: NEW_LOOK }] });

function voiceState(t: number): StudioState {
  const done = VOICE_CLICKS.filter((c) => c.at <= t);
  const last = done.at(-1);
  const press = last === undefined ? 0 : Math.max(0, 1 - Math.abs(t - last.at - 0.06) / 0.12);
  const pick = (name: string, fallback: string) => done.filter((c) => c.target.startsWith(`${name}:`)).at(-1)?.target.split(":")[1] ?? fallback;
  return { kind: "voice", age: pick("age", "adult"), voice: pick("voice", "soft"), mood: pick("mood", "sleepy"), busy: false, pressed: last?.target, press };
}
const voiceTargets = (() => {
  const scratch = document.createElement("canvas").getContext("2d")!;
  return VOICE_CLICKS.map((click) => {
    const box = drawStudio({ g: scratch, k: UI.k }, { layout: LAYOUT, state: voiceState(click.at - 0.001), rise: { title: 1, dock: 1 }, grain: undefined })[click.target];
    return { at: click.at, point: box ? center(box) : { x: W / 2, y: H / 2 } };
  });
})();
const studioCanvas = makeCanvas({ width: Math.round(LAYOUT.square.w), height: Math.round(LAYOUT.square.h) });
const studioCtx = studioCanvas.getContext("2d")!;
const RISE = { omega: 14, zeta: 0.75 };

function drawVoice(t: number) {
  ctx.fillStyle = RISO.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalAlpha = 0.14;
  ctx.fillStyle = grain ?? RISO.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  const rise = { title: spring(t - S.voice - 0.1, RISE), dock: spring(t - S.voice - 0.25, RISE) };
  const catRise = spring(t - S.voice - 0.4, RISE);
  const meowAt = VOICE_CLICKS.filter((c) => c.at <= t).at(-1)?.at;
  const bounce = meowAt === undefined ? 1 : 1 + 0.06 * Math.sin(Math.PI * clamp((t - meowAt) / 0.32));
  const sq = LAYOUT.square;
  const frame = frameOf(VOICE_TAKE, t - VOICE_START);
  const cat = frame.snapshots[0];
  drawRoom({ g: studioCtx, width: sq.w, height: sq.h, take: VOICE_TAKE, simTime: t - VOICE_START, camera: { x: cat?.x ?? 800, y: cat?.y ?? 500, zoom: sq.w / 300 }, resources: studioResources });
  const c = center(sq);
  ctx.save();
  ctx.globalAlpha = clamp(catRise * 1.4);
  ctx.translate(c.x, c.y + (1 - catRise) * 48 * UI.k);
  ctx.scale(bounce, bounce);
  ctx.drawImage(studioCanvas, -sq.w / 2, -sq.h / 2, sq.w, sq.h);
  strokeBox(UI, { x: -sq.w / 2, y: -sq.h / 2, w: sq.w, h: sq.h });
  ctx.restore();
  drawStudio(UI, { layout: LAYOUT, state: voiceState(t), rise, grain });
  const keys = voiceTargets.map((v, i): [number, Point] => [v.at - (i === 0 ? 0.6 : 0.3), v.point]);
  const x = track(t, W * 0.72, keys.map(([at, p]): [number, number] => [at, p.x]), SPRINGS.default);
  const y = track(t, H * 0.95, keys.map(([at, p]): [number, number] => [at, p.y + 4 * UI.k]), SPRINGS.default);
  const lastClick = VOICE_CLICKS.filter((click) => click.at <= t).at(-1);
  pointer(UI, { x, y, press: lastClick ? Math.max(0, 1 - Math.abs(t - lastClick.at - 0.05) / 0.1) : 0, alpha: clamp((t - S.voice - 0.6) / 0.2) });
  numberCard({ t, at: bar(6) + BEAT, out: S.talk - 0.2, big: F.voices[0]!, label: F.voices[1]!, sub: F.voices[2], x: 1580 * UNIT, y: 560 * UNIT, px: 220, stacked: true });
}

// ---------------------------------------------------------------- 3. talk

const TALK_LINES: Line[] = [
  { at: S.talk + 0.9, userId: "talk-cat", text: COPY.lines[8]!, accent: RISO.blue, typed: true, hold: 3.2 },
  { at: S.talk + 4.4, userId: "talk-cat", text: COPY.lines[15]!, accent: RISO.pink, typed: true, hold: 2.2 },
];
lineCues(TALK_LINES);
const talkKeys: CameraKey[] = [
  { at: 0, target: catAt("talk-cat"), zoom: 3.4 },
  { at: 5.2, target: catAt("talk-cat"), zoom: 3.1 },
  { at: 7.0, target: catAt("talk-cat"), zoom: ROOM_FIT * 1.25 },
  { at: 10, target: catAt("talk-cat"), zoom: ROOM_FIT * 1.2 },
];

function drawTalkScene(t: number) {
  const { cats, view } = roomScene("talk", S.talk, t, talkKeys);
  drawLines(t, TALK_LINES, cats, view);
}

// ---------------------------------------------------------------- 4. your finger

const FINGER_STEP = 2 * 4 * BEAT;
const fingerFollow = (frame: TakeFrame) => {
  const cat = catPoint(frame, "finger-cat", 40, 0);
  const finger = frame.fingers.find((f) => f.userId === "finger-you-4" && f.tip.visibility > 0.05);
  return finger ? { x: mix(cat.x, finger.tip.x, 0.35), y: mix(cat.y, finger.tip.y, 0.35) } : cat;
};
const fingerKeys: CameraKey[] = [
  { at: 0, target: fingerFollow, zoom: 2.5 },
  { at: FINGER_STEP * 1, target: fingerFollow, zoom: 2.8 },
  { at: FINGER_STEP * 2, target: fingerFollow, zoom: 2.4 },
  { at: FINGER_STEP * 3, target: fingerFollow, zoom: 2.1 },
  { at: FINGER_STEP * 4, target: fingerFollow, zoom: 2.0 },
  { at: FINGER_STEP * 4 + 1.6, target: fixed({ x: 900, y: 520 }), zoom: ROOM_FIT * 1.1 },
];
for (let i = 0; i < 5; i++) CUES.push({ t: S.finger + i * FINGER_STEP, sfx: "ui:optionPick", gain: 0.5 });

function drawFinger(t: number) {
  roomScene("finger", S.finger, t, fingerKeys);
  const step = Math.min(4, Math.floor((t - S.finger) / FINGER_STEP));
  chipRow({ t, from: S.finger + 0.2, labels: F.fingerSteps, active: step, y: 92 * UNIT, out: S.shared - 0.3 });
}
const FINGER_CAPTIONS = F.fingerCaptions.map((text, i) => ({ text, from: S.finger + i * FINGER_STEP + 0.35, to: S.finger + (i + 1) * FINGER_STEP - 0.25 }));

// ---------------------------------------------------------------- 5. two people, one cat

const sharedKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: 800, y: 520 }), zoom: 2.9 },
  { at: S.social - S.shared, target: fixed({ x: 790, y: 522 }), zoom: 3.2 },
];

// ---------------------------------------------------------------- 6. cats with cats

const SOCIAL_STEP = (S.toys - S.social) / 6;
const socialKeys: CameraKey[] = [
  { at: 0, target: between("social-a", "social-b"), zoom: 2.4 },
  { at: SOCIAL_STEP * 0.85, target: between("social-a", "social-b"), zoom: 2.4 },
  { at: SOCIAL_STEP * 1.15, target: between("social-d", "social-c"), zoom: 1.9 },
  { at: SOCIAL_STEP * 1.85, target: between("social-d", "social-c"), zoom: 1.9 },
  { at: SOCIAL_STEP * 2.15, target: between("social-a", "social-e", 0.75), zoom: 2.1 },
  { at: SOCIAL_STEP * 2.85, target: between("social-a", "social-e", 0.6), zoom: 2.3 },
  { at: SOCIAL_STEP * 3.15, target: between("social-d", "social-f", 0.8), zoom: 2.1 },
  { at: SOCIAL_STEP * 4.85, target: between("social-d", "social-f", 0.5), zoom: 2.6 },
  { at: SOCIAL_STEP * 5.15, target: fixed({ x: 800, y: 500 }), zoom: ROOM_FIT * 1.05 },
];
for (let i = 0; i < 6; i++) CUES.push({ t: S.social + i * SOCIAL_STEP, sfx: "ui:optionPick", gain: 0.5 });

function drawSocial(t: number) {
  roomScene("social", S.social, t, socialKeys);
  chipRow({ t, from: S.social + 0.2, labels: F.socialSteps, active: Math.min(5, Math.floor((t - S.social) / SOCIAL_STEP)), y: 92 * UNIT, out: S.toys - 0.3 });
}

// ---------------------------------------------------------------- 7. toys

const TOY_GRAB = 1.0;
const TOY_DROP = YARN_DROP.at - LEAD;
const toyKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: 820, y: 540 }), zoom: ROOM_FIT * 1.2 },
  { at: TOY_DROP + 0.3, target: fixed({ x: 820, y: 540 }), zoom: ROOM_FIT * 1.2 },
  { at: TOY_DROP + 1.6, target: toyAt(YARN_DROP.id, YARN_DROP), zoom: 2.3 },
  { at: 4.4, target: toyAt(YARN_DROP.id, YARN_DROP), zoom: 2.3 },
  { at: 5.6, target: toyAt("roll-1", { x: 1080, y: 560 }), zoom: 2.2 },
  { at: 7.6, target: toyAt("roll-1", { x: 1080, y: 560 }), zoom: 2.2 },
  { at: S.box - S.toys, target: fixed({ x: 860, y: 520 }), zoom: ROOM_FIT * 1.15 },
];
const TRAY = { right: W - 40 * UNIT, bottom: H - 40 * UNIT };
const yarnButton = (() => {
  const scratch = document.createElement("canvas").getContext("2d")!;
  const box = drawTray({ g: scratch, k: UI.k }, { ...TRAY, unavailableIds: [], label: "", alpha: 1 })[YARN_DROP.id]!;
  return center(box);
})();
CUES.push({ t: S.toys + TOY_GRAB, sfx: "ui:optionPick", gain: 0.6 });
CUES.push({ t: S.toys + TOY_DROP, sfx: "ui:bringIn", gain: 0.5 });

function drawToys(t: number) {
  const u = t - S.toys;
  const { view } = roomScene("toys", S.toys, t, toyKeys);
  const drop = { x: view.offsetX + YARN_DROP.x * view.scale, y: view.offsetY + YARN_DROP.y * view.scale };
  const isHeld = u >= TOY_GRAB && u < TOY_DROP;
  const out = smooth((u - (S.box - S.toys - 0.6)) / 0.4);
  const trayIn = spring(u - 0.1, SPRINGS.pop) * (1 - out);
  drawTray(UI, {
    ...TRAY,
    unavailableIds: u >= TOY_DROP ? ["roll-1", YARN_DROP.id] : ["roll-1"],
    heldId: isHeld ? YARN_DROP.id : undefined,
    held: 0,
    hoverId: YARN_DROP.id,
    hover: clamp((u - 0.55) / 0.15) * (1 - clamp((u - TOY_GRAB) / 0.1)),
    label: COPY.app.room.toyYarn,
    alpha: trayIn,
  });
  const keys: [number, Point][] = [[0.2, yarnButton], [TOY_GRAB + 0.15, yarnButton], [TOY_DROP - 0.1, drop]];
  const x = track(t, W * 0.62, keys.map(([at, p]): [number, number] => [S.toys + at, p.x]), SPRINGS.default);
  const y = track(t, H * 0.7, keys.map(([at, p]): [number, number] => [S.toys + at, p.y]), SPRINGS.default);
  if (isHeld) {
    ctx.save();
    ctx.globalAlpha = 0.95;
    ctx.shadowColor = "rgba(43,58,99,0.35)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 6;
    drawToyIcon(ctx, { itemId: YARN_DROP.id, x: x - 6 * UI.k, y: y - 10 * UI.k, size: 30 * UI.k });
    ctx.restore();
  }
  const press = (at: number) => Math.max(0, 1 - Math.abs(u - at - 0.05) / 0.1);
  pointer(UI, { x, y, press: Math.max(press(TOY_GRAB), press(TOY_DROP)), alpha: clamp(u / 0.2) * (1 - clamp((u - TOY_DROP - 0.5) / 0.3)) });
}

// ---------------------------------------------------------------- 8. box

const boxKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: 790, y: 505 }), zoom: 3.0 },
  { at: S.bowl - S.box, target: fixed({ x: 820, y: 500 }), zoom: 3.3 },
];

// ---------------------------------------------------------------- 9. bowl

const bowlKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: 800, y: 520 }), zoom: 3.1 },
  { at: 3.2, target: fixed({ x: 860, y: 520 }), zoom: 2.9 },
  { at: S.sky - S.bowl, target: catAt("bowl-cat"), zoom: 2.3 },
];

// ---------------------------------------------------------------- 10. sky

const skyKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: 820, y: 520 }), zoom: ROOM_FIT * 1.18 },
  { at: S.langs - S.sky, target: fixed({ x: 800, y: 510 }), zoom: ROOM_FIT * 1.06 },
];

function drawSky(t: number) {
  roomScene("sky", S.sky, t, skyKeys);
  const hour = skyAtFilm(t)?.hour ?? 12;
  const step = hour < 8 ? 0 : hour < 18 ? 1 : hour < 20.3 ? 2 : 3;
  chipRow({ t, from: S.sky + 0.2, labels: F.skySteps, active: step, y: 92 * UNIT, out: S.langs - 0.3 });
}

// ---------------------------------------------------------------- 11. languages and end

const LANG_SPEAKERS = ["lang-a", "lang-d", "lang-b", "lang-e", "lang-c"];
const ACCENTS = [RISO.pink, RISO.blue, RISO.orange, RISO.yellow];
const LANG_LINES: Line[] = [COPY.lines[0]!, ...COPY.hellos].slice(0, 15).map((text, i) => ({ at: S.langs + 0.3 + i * BEAT * 0.9, userId: LANG_SPEAKERS[i % LANG_SPEAKERS.length]!, text, accent: ACCENTS[i % ACCENTS.length]!, hold: 1.5 }));
lineCues(LANG_LINES);
const langKeys: CameraKey[] = [
  { at: 0, target: fixed({ x: 820, y: 500 }), zoom: ROOM_FIT * 1.15 },
  { at: S.end - S.langs, target: fixed({ x: 800, y: 500 }), zoom: ROOM_FIT * 1.05 },
  { at: DUR - S.langs, target: fixed({ x: 800, y: 500 }), zoom: ROOM_FIT * 1.1 },
];
const pawIcon = new Image();
pawIcon.src = "assets/paw-icon.svg";
CUES.push({ t: S.end + 0.5, sfx: "ui:catJoins", gain: 0.6 });

function drawLangs(t: number) {
  const { cats, view } = roomScene("langs", S.langs, t, langKeys);
  drawLines(t, LANG_LINES.filter((line) => line.at < S.end - 1.6), cats, view);
  drawEndCard({ ui: UI, W, H, u: t - S.end, grain, pawIcon });
}

// ---------------------------------------------------------------- timeline

const SCENES: { at: number; draw: (t: number) => void }[] = [
  { at: S.grid, draw: drawGrid },
  { at: S.voice, draw: drawVoice },
  { at: S.talk, draw: drawTalkScene },
  { at: S.finger, draw: drawFinger },
  { at: S.shared, draw: (t) => roomScene("shared", S.shared, t, sharedKeys) },
  { at: S.social, draw: drawSocial },
  { at: S.toys, draw: drawToys },
  { at: S.box, draw: (t) => roomScene("box", S.box, t, boxKeys) },
  { at: S.bowl, draw: (t) => roomScene("bowl", S.bowl, t, bowlKeys) },
  { at: S.sky, draw: drawSky },
  { at: S.langs, draw: drawLangs },
];
for (const scene of SCENES.slice(1)) CUES.push({ t: scene.at, sfx: "ui:stepNext", gain: 0.5 });

const CAPTIONS: { text: string; from: number; to: number; y?: number }[] = [
  { text: F.askCats, from: bar(1) + 2 * BEAT, to: bar(3) - BEAT },
  { text: F.talk, from: S.talk + 0.4, to: S.finger - 0.4 },
  ...FINGER_CAPTIONS,
  { text: F.shared, from: S.shared + 0.4, to: S.social - 0.4 },
  { text: F.social, from: S.social + 0.4, to: S.social + SOCIAL_STEP * 1.6 },
  { text: F.toys[0]!, from: S.toys + 0.3, to: S.toys + TOY_DROP + 0.4, y: 150 * UNIT },
  { text: F.toys[1]!, from: S.toys + 3.4, to: S.box - 0.5, y: 150 * UNIT },
  { text: F.box[0]!, from: S.box + 0.3, to: S.box + BOX_POKE - LEAD - 0.4 },
  { text: F.box[1]!, from: S.box + BOX_POKE - LEAD - 0.2, to: S.bowl - 0.4 },
  { text: F.bowl[0]!, from: S.bowl + 0.3, to: S.bowl + 3.7 },
  { text: F.bowl[1]!, from: S.bowl + 4.0, to: S.sky - 0.4 },
  { text: F.sky[0]!, from: S.sky + 0.4, to: S.sky + 5.4 },
  { text: F.sky[1]!, from: S.sky + 6.6, to: S.langs - 0.4 },
  { text: F.langs, from: S.langs + 0.4, to: S.end - 0.4 },
];

/** Draw the yellow ink roller crossing the frame at `edge`. */
function roller(edge: number) {
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

function seek(t: number) {
  const index = SCENES.findLastIndex((scene) => scene.at <= t);
  const scene = SCENES[Math.max(0, index)]!;
  const wipe = index > 0 ? spring(t - scene.at, { omega: 7, zeta: 1 }) : 1;
  if (wipe < 0.999) {
    SCENES[index - 1]!.draw(t);
    const edge = wipe * (W + 260 * UNIT) - 130 * UNIT;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, Math.max(0, edge), H);
    ctx.clip();
    scene.draw(t);
    ctx.restore();
    roller(edge);
  } else {
    scene.draw(t);
  }
  const night = skyAtFilm(t)?.lamp ?? 0;
  for (const caption of CAPTIONS) drawCaption({ g: ctx, W, H, t, size: "line", night, ...caption });
  const fade = smooth((t - (DUR - 0.6)) / 0.6);
  if (fade > 0) {
    ctx.fillStyle = `rgba(243,239,228,${fade})`;
    ctx.fillRect(0, 0, W, H);
  }
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
  takeCues("talk", S.talk, S.finger);
  takeCues("finger", S.finger, S.shared);
  takeCues("shared", S.shared, S.social);
  takeCues("social", S.social, S.toys);
  takeCues("toys", S.toys, S.box);
  takeCues("box", S.box, S.bowl);
  takeCues("bowl", S.bowl, S.sky);
  takeCues("sky", S.sky, S.langs);
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
