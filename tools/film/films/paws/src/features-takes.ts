import { BELLIES, COAT_INKS, type CatLook, PAD_INKS, PATTERNS, STEPS, TAIL_SHAPES } from "@/lib/paws/cat-look";
import { shuffleCatLook } from "@/lib/paws/maker/shuffle-cat-look";
import { createSeededRandom } from "@/lib/paws/sim/create-seeded-random";
import { placeLegsAtRest } from "@/lib/paws/sim/place-legs-at-rest";
import { setCatState } from "@/lib/paws/sim/set-cat-state";
import { startZoomies } from "@/lib/paws/sim/start-zoomies";
import type { World } from "@/lib/paws/sim/sim-types";
import { placeToy } from "@/lib/paws/sim/place-toy";
import type { VoiceSettings } from "@/lib/paws/voice-settings";

import type { Take, TakeFinger } from "./run-take";
import { asleepInBox, batWhenPawed, calm, climbIn, curious, goTo, LOOKS, playWith, rest, spill, tap, toy, walk } from "./takes";

const BEAT = 60 / 129.98;
/** Seconds of sim each take runs before its scene is on screen, so cats are settled when it appears. */
export const LEAD = 1;

/** Which look fields each step of the maker scene changes, one step every two beats after two bars of full shuffles. */
export const LOOK_STEPS = ["coat", "pattern", "belly", "pads", "shape"] as const;
const SHUFFLE_BEATS = 8;
const STEP_BEATS = 2;
const GRID = Array.from({ length: 12 }, (_, i) => ({ id: `grid-${i}`, col: i % 3, row: Math.floor(i / 3) }));
export const GRID_CENTER = { x: 800, y: 470 };

const pick = <T,>(random: () => number, list: readonly T[], not: T) => {
  const options = list.filter((v) => v !== not);
  return options[Math.floor(random() * options.length)]!;
};

/** Each grid cat's looks, one per beat: full shuffles first, then one field (or the four shape fields) at a time. */
const gridLooks = (() => {
  const random = createSeededRandom({ seed: 61 });
  return GRID.map(() => {
    let look = shuffleCatLook({ random });
    const changes: [number, CatLook][] = [];
    for (let beat = 1; beat < SHUFFLE_BEATS + LOOK_STEPS.length * STEP_BEATS; beat++) {
      const step = LOOK_STEPS[Math.floor((beat - SHUFFLE_BEATS) / STEP_BEATS)];
      if (step === undefined) look = shuffleCatLook({ random });
      else if (step === "coat") look = { ...look, coat: pick(random, Object.keys(COAT_INKS) as (keyof typeof COAT_INKS)[], look.coat) };
      else if (step === "pattern") look = { ...look, pattern: pick(random, PATTERNS, look.pattern) };
      else if (step === "belly") look = { ...look, belly: pick(random, BELLIES, look.belly) };
      else if (step === "pads") look = { ...look, pads: pick(random, Object.keys(PAD_INKS) as (keyof typeof PAD_INKS)[], look.pads) };
      else look = { ...look, size: pick(random, STEPS, look.size), fluff: pick(random, STEPS, look.fluff), tail: pick(random, STEPS, look.tail), tailShape: pick(random, TAIL_SHAPES, look.tailShape), ears: pick(random, STEPS, look.ears) };
      changes.push([0.067 + beat * BEAT, look]);
    }
    return changes;
  });
})();

const CROWD_OUT = LEAD + 14.6;

/** A thread a yarn ball has already laid, looping across the floor to where the ball lies. */
const YARN_TRAIL: [number, number][] = Array.from({ length: 70 }, (_, i) => {
  const u = i / 69;
  return [Math.round(420 + u * 340 + Math.sin(u * 7) * 70), Math.round(820 - u * 180 + Math.cos(u * 5) * 50)];
});

/** Put cat `userId` standing still at `x, y` facing `heading`, and keep it there. */
function stand(world: World, userId: string, at: { x: number; y: number; heading: number }) {
  const cat = world.cats[userId];
  if (cat === undefined) return;
  Object.assign(cat, { x: at.x, y: at.y, heading: at.heading, rest: undefined, wander: undefined, pauseSeconds: 999, zoomiesCooldownUntil: 999 });
  setCatState(cat, "pause");
  placeLegsAtRest(cat);
}

/** Start `kind` between `catId` and `partnerId` the way `startSocial` does, without its random choice of kind. */
const social = (kind: "greet" | "chase" | "bat" | "snuggle", catId: string, partnerId: string) => (world: World) => {
  const cat = world.cats[catId];
  const partner = world.cats[partnerId];
  if (cat === undefined || partner === undefined) return;
  cat.partnerId = partner.userId;
  cat.focusId = undefined;
  if (kind === "greet") {
    cat.social = { kind: "greet", t: 0, sniffT: 0, sniffing: false, lead: true, printed: false };
    partner.social = { kind: "greet", t: 0, sniffT: 0, sniffing: false, lead: false, printed: false };
    partner.partnerId = cat.userId;
    partner.rest = undefined;
    setCatState(cat, "greet");
    setCatState(partner, "greet");
  } else if (kind === "chase") {
    cat.social = { kind: "chase", t: 0, durationSeconds: 3.4 };
    partner.social = { kind: "chased", t: 0 };
    partner.partnerId = cat.userId;
    partner.rest = undefined;
    setCatState(cat, "chase");
    setCatState(partner, "chased");
  } else if (kind === "bat") {
    cat.social = { kind: "bat", t: 0, durationSeconds: 6, phase: "go" };
    setCatState(cat, "bat");
  } else {
    const gap = 85 * (cat.build.scale + partner.build.scale);
    cat.wander = { x: partner.x - Math.sin(partner.heading) * gap, y: partner.y + Math.cos(partner.heading) * gap };
    cat.isSnuggling = true;
    setCatState(cat, "approach");
  }
};

/** Let cat `catId` lie down and fall asleep where it is. */
const nap = (catId: string) => (world: World) => {
  const cat = world.cats[catId];
  if (cat === undefined) return;
  cat.rest = "sleep";
  setCatState(cat, "sleep");
};

const zoomies = (catId: string) => (world: World) => {
  const cat = world.cats[catId];
  if (cat) startZoomies({ world, cat });
};

/** Where the finger cat was when the swipe started; the swipe finger reads it so it crosses the cat wherever the cat is. */
const swipeFrom = { x: 800, y: 500 };
const SWIPE = { at: LEAD + 15.4, seconds: 0.2, length: 1300 };

/** Where the yarn ball lands when it is dragged in from the tray, in world units. */
export const YARN_DROP = { at: LEAD + 1.9, id: "yarn-2", x: 640, y: 540 } as const;
/** The bowl take starts earlier, so the cat is already at the bowl when its scene begins. */
const BOWL_LEAD = 3.1;
/** When the finger presses on the box with the cat inside. */
export const BOX_POKE = LEAD + 3.4;

/** The voice each cat in these takes speaks with. */
export const FEATURE_VOICES: { [userId: string]: { voice: VoiceSettings; size: "small" | "medium" | "large" } } = {
  "talk-cat": { voice: { age: "kitten", voice: "squeaky", mood: "chatty" }, size: LOOKS.lilac.size },
  "finger-cat": { voice: { age: "adult", voice: "soft", mood: "chatty" }, size: LOOKS.hero.size },
  "shared-cat": { voice: { age: "adult", voice: "squeaky", mood: "chatty" }, size: LOOKS.calico.size },
  "social-a": { voice: { age: "adult", voice: "soft", mood: "chatty" }, size: LOOKS.hero.size },
  "social-b": { voice: { age: "old", voice: "raspy", mood: "sleepy" }, size: LOOKS.cream.size },
  "social-c": { voice: { age: "adult", voice: "deep", mood: "grumpy" }, size: LOOKS.ink.size },
  "social-d": { voice: { age: "kitten", voice: "squeaky", mood: "chatty" }, size: LOOKS.lilac.size },
  "social-e": { voice: { age: "adult", voice: "squeaky", mood: "chatty" }, size: LOOKS.calico.size },
  "social-f": { voice: { age: "adult", voice: "raspy", mood: "grumpy" }, size: LOOKS.choc.size },
  "toy-a": { voice: { age: "adult", voice: "squeaky", mood: "chatty" }, size: LOOKS.calico.size },
  "toy-b": { voice: { age: "adult", voice: "deep", mood: "grumpy" }, size: LOOKS.ink.size },
  "box-cat": { voice: { age: "adult", voice: "soft", mood: "chatty" }, size: LOOKS.hero.size },
  "bowl-cat": { voice: { age: "adult", voice: "raspy", mood: "grumpy" }, size: LOOKS.choc.size },
  "lang-a": { voice: { age: "adult", voice: "soft", mood: "chatty" }, size: LOOKS.hero.size },
  "lang-b": { voice: { age: "adult", voice: "deep", mood: "grumpy" }, size: LOOKS.ink.size },
  "lang-c": { voice: { age: "old", voice: "raspy", mood: "sleepy" }, size: LOOKS.cream.size },
  "lang-d": { voice: { age: "adult", voice: "squeaky", mood: "chatty" }, size: LOOKS.calico.size },
  "lang-e": { voice: { age: "kitten", voice: "squeaky", mood: "chatty" }, size: LOOKS.lilac.size },
};

export const FEATURE_TAKES: { [name: string]: Take } = {
  grid: {
    seed: 31,
    fps: 60,
    seconds: 16,
    residents: GRID.map((cell, i) => ({ userId: cell.id, look: gridLooks[i]![0]![1], restyles: gridLooks[i] })),
    setup: (world) => {
      for (const cell of GRID) stand(world, cell.id, { x: GRID_CENTER.x + (cell.col - 1) * 380 + (cell.row % 2 === 0 ? -30 : 30), y: GRID_CENTER.y + (cell.row - 1.5) * 128, heading: (cell.row % 2 === 0 ? 0 : Math.PI) + (cell.col - 1) * 0.04 });
      calm(GRID.map((c) => c.id), 99)(world);
    },
  },
  talk: {
    seed: 41,
    fps: 60,
    seconds: LEAD + 11,
    residents: [
      { userId: "talk-cat", look: LOOKS.lilac },
      { userId: "talk-ink", look: LOOKS.ink },
    ],
    setup: (world) => {
      rest(world, "talk-cat", { x: 800, y: 520, heading: -0.3 }, "sit");
      rest(world, "talk-ink", { x: 1260, y: 330, heading: 2.6 }, "sleep");
      calm(["talk-cat", "talk-ink"], 99)(world);
    },
    directions: [{ at: LEAD + 6.3, run: zoomies("talk-cat") }],
  },
  finger: {
    seed: 51,
    fps: 120,
    seconds: LEAD + 19,
    residents: [
      { userId: "finger-cat", look: LOOKS.hero },
      { userId: "finger-cream", look: LOOKS.cream },
    ],
    setup: (world) => {
      walk(world, "finger-cat", { x: 520, y: 600, heading: -0.2 }, { x: 640, y: 560 });
      rest(world, "finger-cream", { x: 1320, y: 260, heading: 2.4 }, "sleep");
      calm(["finger-cat", "finger-cream"], 99)(world);
    },
    fingers: [
      {
        ...tap({ userId: "finger-you-4", x: 880, y: 500, inAt: LEAD + 0.2, presses: [[LEAD + 3.75, LEAD + 7.2]], outAt: LEAD + 14.8, wiggle: { from: LEAD + 7.6, to: LEAD + 10.9, radius: 70 } }),
      },
      tap({ userId: "finger-ana-9", x: 740, y: 400, inAt: LEAD + 11.2, presses: [], outAt: CROWD_OUT }),
      tap({ userId: "finger-tom-6", x: 750, y: 610, inAt: LEAD + 11.6, presses: [], outAt: CROWD_OUT }),
      {
        userId: "finger-swipe-2",
        at: (t) => {
          const u = (t - SWIPE.at) / SWIPE.seconds;
          if (u < -0.2 || u > 1.2) return undefined;
          return { x: swipeFrom.x - 900 + SWIPE.length * Math.min(1, Math.max(0, u)), y: swipeFrom.y - 40, pressed: false };
        },
      },
    ],
    directions: [
      { at: LEAD + 0.6, run: curious("finger-cat", "finger-you-4") },
      { at: LEAD + 0.6, run: (world) => { const cat = world.cats["finger-cat"]; if (cat) cat.sniffCooldownSeconds = 6; } },
      { at: LEAD + 7.4, run: curious("finger-cat", "finger-you-4") },
      { at: LEAD + 11.1, run: (world) => { const cat = world.cats["finger-cat"]; if (cat) cat.curiousCooldownUntil = 0; } },
      { at: SWIPE.at - 0.25, run: (world) => { const cat = world.cats["finger-cat"]; if (cat) Object.assign(swipeFrom, { x: cat.x, y: cat.y }); } },
    ],
  },
  shared: {
    seed: 71,
    fps: 120,
    seconds: LEAD + 6.5,
    residents: [{ userId: "shared-cat", look: LOOKS.calico }],
    setup: (world) => {
      walk(world, "shared-cat", { x: 560, y: 520, heading: 0 }, { x: 700, y: 520 });
      calm(["shared-cat"], 99)(world);
    },
    fingers: [
      tap({ userId: "shared-mia-3", x: 870, y: 445, inAt: LEAD - 0.6, presses: [[LEAD + 0.6, LEAD + 6]], outAt: LEAD + 6.4 }),
      tap({ userId: "shared-leo-11", x: 870, y: 600, inAt: LEAD - 0.3, presses: [[LEAD + 0.9, LEAD + 6]], outAt: LEAD + 6.4 }),
    ],
    directions: [{ at: LEAD - 0.4, run: curious("shared-cat", "shared-mia-3") }],
  },
  social: {
    seed: 81,
    fps: 60,
    seconds: LEAD + 19,
    residents: [
      { userId: "social-a", look: LOOKS.hero },
      { userId: "social-b", look: LOOKS.cream },
      { userId: "social-c", look: LOOKS.ink },
      { userId: "social-d", look: LOOKS.lilac },
      { userId: "social-e", look: LOOKS.calico },
      { userId: "social-f", look: LOOKS.choc },
    ],
    setup: (world) => {
      walk(world, "social-a", { x: 240, y: 330, heading: 0 }, { x: 330, y: 330 });
      walk(world, "social-b", { x: 720, y: 300, heading: Math.PI }, { x: 620, y: 310 });
      rest(world, "social-c", { x: 1240, y: 300, heading: 2.8 }, "sit");
      walk(world, "social-d", { x: 700, y: 600, heading: -0.3 }, { x: 760, y: 580 });
      rest(world, "social-e", { x: 560, y: 540, heading: 0.3 }, "sit");
      rest(world, "social-f", { x: 1180, y: 560, heading: 2.9 }, "sleep");
      calm(["social-a", "social-b", "social-c", "social-d", "social-e", "social-f"], 99)(world);
    },
    directions: [
      { at: LEAD + 0.1, run: social("greet", "social-a", "social-b") },
      { at: LEAD + 3.1, run: social("chase", "social-d", "social-c") },
      { at: LEAD + 6.2, run: social("bat", "social-a", "social-e") },
      { at: LEAD + 6.8, run: social("snuggle", "social-d", "social-f") },
      { at: LEAD + 12.5, run: nap("social-d") },
      { at: LEAD + 15.5, run: zoomies("social-b") },
    ],
  },
  toys: {
    seed: 101,
    fps: 120,
    seconds: LEAD + 10,
    residents: [
      { userId: "toy-a", look: LOOKS.calico },
      { userId: "toy-b", look: LOOKS.ink },
    ],
    toys: [toy.roll("roll-1", 1080, 560), toy.box("box-1", 1380, 300, 0.2), toy.bowl("bowl-1", 300, 300)],
    setup: (world) => {
      rest(world, "toy-a", { x: 470, y: 560, heading: 0.2 }, "sit");
      walk(world, "toy-b", { x: 1240, y: 760, heading: -2.4 }, { x: 1180, y: 700 });
      calm(["toy-a", "toy-b"], 99)(world);
    },
    watch: (world) => {
      batWhenPawed("toy-a", YARN_DROP.id, { speed: 300 })(world);
      batWhenPawed("toy-b", "roll-1", { speed: 240 })(world);
    },
    directions: [
      { at: YARN_DROP.at, run: (world) => void placeToy({ world, itemId: YARN_DROP.id, x: YARN_DROP.x, y: YARN_DROP.y }) },
      { at: YARN_DROP.at + 0.15, run: playWith("toy-a", YARN_DROP.id) },
      { at: LEAD + 3.0, run: playWith("toy-b", "roll-1") },
    ],
  },
  box: {
    seed: 111,
    fps: 120,
    seconds: LEAD + 6.5,
    residents: [{ userId: "box-cat", look: LOOKS.hero }],
    toys: [toy.box("box-1", 820, 500, 0.15), toy.bowl("bowl-1", 1250, 330)],
    setup: (world) => {
      walk(world, "box-cat", { x: 640, y: 530, heading: -0.1 }, { x: 700, y: 520 });
      calm(["box-cat"], 99)(world);
    },
    fingers: [tap({ userId: "box-you-8", x: 870, y: 470, inAt: BOX_POKE - 0.8, presses: [[BOX_POKE, BOX_POKE + 0.5]], outAt: BOX_POKE + 1.2 })],
    directions: [{ at: 0.05, run: climbIn("box-cat", "box-1") }],
  },
  bowl: {
    seed: 121,
    fps: 120,
    lead: BOWL_LEAD,
    seconds: BOWL_LEAD + 8,
    residents: [{ userId: "bowl-cat", look: LOOKS.choc }],
    toys: [toy.bowl("bowl-1", 820, 500), toy.box("box-1", 300, 280, -0.25)],
    setup: (world) => {
      walk(world, "bowl-cat", { x: 520, y: 600, heading: -0.2 }, { x: 640, y: 560 });
      calm(["bowl-cat"], 99)(world);
    },
    watch: batWhenPawed("bowl-cat", "bowl-1", { angle: 2.4 }),
    directions: [
      { at: 0.4, run: playWith("bowl-cat", "bowl-1") },
      { at: BOWL_LEAD + 2.3, run: goTo("bowl-cat", { x: 900, y: 660 }) },
      { at: BOWL_LEAD + 3.3, run: goTo("bowl-cat", { x: 1320, y: 600 }) },
    ],
  },
  sky: {
    seed: 131,
    fps: 60,
    seconds: LEAD + 10,
    residents: [
      { userId: "sky-a", look: LOOKS.choc },
      { userId: "sky-b", look: LOOKS.ink },
      { userId: "sky-c", look: LOOKS.lilac },
    ],
    toys: [toy.box("box-1", 560, 330, -0.2), toy.box("box-2", 1220, 700, 0.3), toy.bowl("bowl-1", 1040, 300), toy.bowl("bowl-2", 380, 760), toy.bowl("bowl-3", 1380, 420), toy.yarn("yarn-4", 760, 640, 0.7)],
    setup: (world) => {
      asleepInBox(world, "sky-a", "box-1", -0.2, 40);
      rest(world, "sky-b", { x: 1000, y: 560, heading: 2.7 }, "sit");
      rest(world, "sky-c", { x: 640, y: 560, heading: -0.4 }, "sleep");
      world.trails["yarn-4"] = YARN_TRAIL;
      calm(["sky-a", "sky-b", "sky-c"], 99)(world);
    },
  },
  langs: {
    seed: 91,
    fps: 60,
    seconds: LEAD + 16,
    residents: [
      { userId: "lang-a", look: LOOKS.hero },
      { userId: "lang-b", look: LOOKS.ink },
      { userId: "lang-c", look: LOOKS.cream },
      { userId: "lang-d", look: LOOKS.calico },
      { userId: "lang-e", look: LOOKS.lilac },
    ],
    toys: [toy.box("box-1", 1420, 230, 0.2), toy.box("box-2", 230, 800, -0.3), toy.bowl("bowl-1", 720, 420), toy.bowl("bowl-2", 1460, 640), toy.bowl("bowl-3", 200, 320), toy.yarn("yarn-4", 760, 640, 0.7)],
    setup: (world) => {
      walk(world, "lang-a", { x: 300, y: 560, heading: 0 }, { x: 560, y: 600 });
      rest(world, "lang-b", { x: 1240, y: 420, heading: 2.9 }, "sit");
      rest(world, "lang-c", { x: 520, y: 270, heading: 0.4 }, "sleep");
      rest(world, "lang-d", { x: 960, y: 250, heading: 2.2 }, "sit");
      walk(world, "lang-e", { x: 1300, y: 760, heading: Math.PI }, { x: 980, y: 700 });
      world.trails["yarn-4"] = YARN_TRAIL;
      calm(["lang-a", "lang-b", "lang-c", "lang-d", "lang-e"], 99)(world);
    },
  },
};
