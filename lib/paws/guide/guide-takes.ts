import { makeCurious } from "@/lib/paws/sim/make-curious";
import { setCatState } from "@/lib/paws/sim/set-cat-state";
import type { World } from "@/lib/paws/sim/sim-types";
import { startZoomies } from "@/lib/paws/sim/start-zoomies";

import { guideFinger } from "./guide-finger";
import { GUIDE_LOOKS } from "./guide-looks";
import type { GuideTake } from "./guide-types";
import { poseGuideCat } from "./pose-guide-cat";

const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));

function curious(options: { catId: string; fingerId: string }) {
  return (world: World) => {
    const cat = world.cats[options.catId];
    if (cat !== undefined)
      makeCurious({ world, cat, fingerId: options.fingerId });
  };
}

function wiggle(options: {
  x: number;
  y: number;
  from: number;
  to: number;
  radius: number;
}) {
  return (t: number) => {
    const amount =
      options.radius *
      ease((t - options.from) / 0.4) *
      ease((options.to - t) / 0.4);
    return {
      x: options.x + Math.sin((t - options.from) * 9) * amount,
      y: options.y + Math.cos((t - options.from) * 6.3) * amount * 0.6,
    };
  };
}

function swipe(options: { pressed: boolean }): GuideTake {
  const at = 2;
  const seconds = 0.22;
  return {
    seed: 17,
    loopSeconds: 5.5,
    span: 1000,
    camera: { kind: "fixed", x: 800, y: 500 },
    cats: [{ userId: "swipe-cat", look: GUIDE_LOOKS.cream }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "swipe-cat",
        at: { x: 800, y: 520, heading: -0.3 },
        then: { kind: "rest", pose: "sit" },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: at - 0.05,
        outAt: at + seconds + 0.05,
        presses: options.pressed ? [[0, 99]] : [],
        path: (t) => ({
          x: 200 + 1300 * Math.min(1, Math.max(0, (t - at) / seconds)),
          y: 470,
        }),
      }),
    ],
  };
}

/** The scripted takes behind each guide preview, by guide item. */
export const GUIDE_TAKES = {
  move: {
    seed: 11,
    loopSeconds: 7,
    span: 640,
    camera: { kind: "follow", ids: ["move-cat", "guide-you"] },
    cats: [{ userId: "move-cat", look: GUIDE_LOOKS.hero }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "move-cat",
        at: { x: 700, y: 540, heading: 0 },
        then: { kind: "rest", pose: "sit" },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.6,
        outAt: 6.2,
        presses: [],
        path: (t) => ({
          x: 900 + 110 * Math.sin(t * 0.9),
          y: 470 + 70 * Math.sin(t * 1.4),
        }),
      }),
    ],
    directions: [
      { at: 1, run: curious({ catId: "move-cat", fingerId: "guide-you" }) },
    ],
  },
  still: {
    seed: 23,
    loopSeconds: 7.5,
    span: 560,
    camera: { kind: "follow", ids: ["still-cat", "guide-you"] },
    cats: [{ userId: "still-cat", look: GUIDE_LOOKS.ink }],
    setup: (world) => {
      poseGuideCat({
        world,
        userId: "still-cat",
        at: { x: 560, y: 560, heading: -0.1 },
        then: { kind: "walk", goal: { x: 620, y: 540 } },
      });
      const cat = world.cats["still-cat"];
      if (cat !== undefined) cat.sniffCooldownSeconds = 0;
    },
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.4,
        outAt: 6.8,
        presses: [],
        path: () => ({ x: 860, y: 490 }),
      }),
    ],
    directions: [
      { at: 0.8, run: curious({ catId: "still-cat", fingerId: "guide-you" }) },
    ],
  },
  press: {
    seed: 31,
    loopSeconds: 6.8,
    span: 520,
    camera: { kind: "follow", ids: ["press-cat", "guide-you"] },
    cats: [{ userId: "press-cat", look: GUIDE_LOOKS.hero }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "press-cat",
        at: { x: 700, y: 520, heading: 0 },
        then: { kind: "rest", pose: "sit" },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.4,
        outAt: 6,
        presses: [[1.2, 5.2]],
        path: () => ({ x: 880, y: 500 }),
      }),
    ],
    directions: [
      { at: 0.5, run: curious({ catId: "press-cat", fingerId: "guide-you" }) },
    ],
  },
  wiggle: {
    seed: 41,
    loopSeconds: 7,
    span: 620,
    camera: { kind: "follow", ids: ["wiggle-cat", "guide-you"] },
    cats: [{ userId: "wiggle-cat", look: GUIDE_LOOKS.lilac }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "wiggle-cat",
        at: { x: 680, y: 520, heading: 0 },
        then: { kind: "rest", pose: "sit" },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.4,
        outAt: 6.4,
        presses: [],
        path: wiggle({ x: 880, y: 480, from: 1, to: 6, radius: 90 }),
      }),
    ],
    directions: [
      { at: 0.6, run: curious({ catId: "wiggle-cat", fingerId: "guide-you" }) },
    ],
  },
  swipe: swipe({ pressed: false }),
  touchSwipe: swipe({ pressed: true }),
  touchHold: {
    seed: 53,
    loopSeconds: 6.8,
    span: 540,
    camera: { kind: "follow", ids: ["hold-cat", "guide-you"] },
    cats: [{ userId: "hold-cat", look: GUIDE_LOOKS.hero }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "hold-cat",
        at: { x: 560, y: 540, heading: 0 },
        then: { kind: "walk", goal: { x: 640, y: 530 } },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.6,
        outAt: 5.4,
        presses: [[0, 99]],
        path: () => ({ x: 880, y: 500 }),
      }),
    ],
    directions: [
      { at: 0.7, run: curious({ catId: "hold-cat", fingerId: "guide-you" }) },
    ],
  },
  touchSlide: {
    seed: 59,
    loopSeconds: 7,
    span: 620,
    camera: { kind: "follow", ids: ["slide-cat", "guide-you"] },
    cats: [{ userId: "slide-cat", look: GUIDE_LOOKS.lilac }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "slide-cat",
        at: { x: 700, y: 520, heading: 0 },
        then: { kind: "rest", pose: "sit" },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.5,
        outAt: 6.2,
        presses: [[0, 99]],
        path: (t) => ({
          x: 880 + 100 * Math.sin((t - 0.5) * 0.8),
          y: 500 + 60 * Math.sin((t - 0.5) * 1.1),
        }),
      }),
    ],
    directions: [
      { at: 0.6, run: curious({ catId: "slide-cat", fingerId: "guide-you" }) },
    ],
  },
  everyone: {
    seed: 61,
    loopSeconds: 8,
    span: 1300,
    camera: { kind: "fixed", x: 800, y: 500 },
    cats: [
      { userId: "every-a", look: GUIDE_LOOKS.hero },
      { userId: "every-b", look: GUIDE_LOOKS.ink },
      { userId: "every-c", look: GUIDE_LOOKS.cream },
    ],
    setup: (world) => {
      poseGuideCat({
        world,
        userId: "every-a",
        at: { x: 420, y: 560, heading: 0 },
        then: { kind: "rest", pose: "sit" },
      });
      poseGuideCat({
        world,
        userId: "every-b",
        at: { x: 1120, y: 360, heading: Math.PI },
        then: { kind: "rest", pose: "sit" },
      });
      poseGuideCat({
        world,
        userId: "every-c",
        at: { x: 900, y: 700, heading: 2.6 },
        then: { kind: "rest", pose: "sleep" },
      });
    },
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.5,
        outAt: 7,
        presses: [[3, 5.5]],
        path: (t) => ({ x: 640 + 60 * Math.sin(t * 0.7), y: 520 }),
      }),
      guideFinger({
        userId: "guide-ana",
        own: false,
        inAt: 1,
        outAt: 7.2,
        presses: [],
        path: (t) => ({
          x: 1000 + 160 * Math.sin(t * 0.6),
          y: 330 + 60 * Math.sin(t * 1.1),
        }),
      }),
      guideFinger({
        userId: "guide-tom",
        own: false,
        inAt: 1.6,
        outAt: 6.6,
        presses: [[2.4, 6]],
        path: () => ({ x: 1080, y: 640 }),
      }),
    ],
    directions: [
      { at: 0.7, run: curious({ catId: "every-a", fingerId: "guide-you" }) },
      { at: 1.2, run: curious({ catId: "every-b", fingerId: "guide-ana" }) },
    ],
  },
  share: {
    seed: 71,
    loopSeconds: 7,
    span: 620,
    camera: { kind: "follow", ids: ["share-cat"] },
    cats: [{ userId: "share-cat", look: GUIDE_LOOKS.calico }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "share-cat",
        at: { x: 560, y: 520, heading: 0 },
        then: { kind: "walk", goal: { x: 700, y: 520 } },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.4,
        outAt: 6.4,
        presses: [[1.2, 6]],
        path: () => ({ x: 870, y: 445 }),
      }),
      guideFinger({
        userId: "guide-leo",
        own: false,
        inAt: 0.7,
        outAt: 6.4,
        presses: [[1.5, 6]],
        path: () => ({ x: 870, y: 600 }),
      }),
    ],
    directions: [
      { at: 0.5, run: curious({ catId: "share-cat", fingerId: "guide-you" }) },
    ],
  },
  crowd: {
    seed: 79,
    loopSeconds: 7,
    span: 820,
    camera: { kind: "fixed", x: 820, y: 510 },
    cats: [{ userId: "crowd-cat", look: GUIDE_LOOKS.hero }],
    setup: (world) =>
      poseGuideCat({
        world,
        userId: "crowd-cat",
        at: { x: 760, y: 520, heading: 0 },
        then: { kind: "rest", pose: "sit" },
      }),
    fingers: [
      guideFinger({
        userId: "guide-you",
        own: true,
        inAt: 0.4,
        outAt: 6,
        presses: [],
        path: () => ({ x: 920, y: 500 }),
      }),
      guideFinger({
        userId: "guide-ana",
        own: false,
        inAt: 2.6,
        outAt: 6,
        presses: [],
        path: () => ({ x: 740, y: 390 }),
      }),
      guideFinger({
        userId: "guide-tom",
        own: false,
        inAt: 3,
        outAt: 6,
        presses: [],
        path: () => ({ x: 750, y: 650 }),
      }),
    ],
    directions: [
      { at: 0.6, run: curious({ catId: "crowd-cat", fingerId: "guide-you" }) },
      {
        at: 2.5,
        run: (world) => {
          const cat = world.cats["crowd-cat"];
          if (cat !== undefined) cat.curiousCooldownUntil = 0;
        },
      },
    ],
  },
  cats: {
    seed: 81,
    loopSeconds: 18,
    span: 1500,
    camera: { kind: "fixed", x: 760, y: 470 },
    cats: [
      { userId: "social-a", look: GUIDE_LOOKS.hero },
      { userId: "social-b", look: GUIDE_LOOKS.cream },
      { userId: "social-c", look: GUIDE_LOOKS.ink },
      { userId: "social-d", look: GUIDE_LOOKS.lilac },
      { userId: "social-e", look: GUIDE_LOOKS.calico },
      { userId: "social-f", look: GUIDE_LOOKS.choc },
    ],
    setup: (world) => {
      poseGuideCat({
        world,
        userId: "social-a",
        at: { x: 240, y: 330, heading: 0 },
        then: { kind: "walk", goal: { x: 330, y: 330 } },
      });
      poseGuideCat({
        world,
        userId: "social-b",
        at: { x: 720, y: 300, heading: Math.PI },
        then: { kind: "walk", goal: { x: 620, y: 310 } },
      });
      poseGuideCat({
        world,
        userId: "social-c",
        at: { x: 1240, y: 300, heading: 2.8 },
        then: { kind: "rest", pose: "sit" },
      });
      poseGuideCat({
        world,
        userId: "social-d",
        at: { x: 700, y: 600, heading: -0.3 },
        then: { kind: "walk", goal: { x: 760, y: 580 } },
      });
      poseGuideCat({
        world,
        userId: "social-e",
        at: { x: 560, y: 540, heading: 0.3 },
        then: { kind: "rest", pose: "sit" },
      });
      poseGuideCat({
        world,
        userId: "social-f",
        at: { x: 1180, y: 560, heading: 2.9 },
        then: { kind: "rest", pose: "sleep" },
      });
    },
    directions: [
      {
        at: 0.1,
        run: (world) =>
          startPair({
            world,
            kind: "greet",
            catId: "social-a",
            partnerId: "social-b",
          }),
      },
      {
        at: 3.1,
        run: (world) =>
          startPair({
            world,
            kind: "chase",
            catId: "social-d",
            partnerId: "social-c",
          }),
      },
      {
        at: 6.2,
        run: (world) =>
          startPair({
            world,
            kind: "bat",
            catId: "social-a",
            partnerId: "social-e",
          }),
      },
      {
        at: 6.8,
        run: (world) =>
          startPair({
            world,
            kind: "snuggle",
            catId: "social-d",
            partnerId: "social-f",
          }),
      },
      {
        at: 12.5,
        run: (world) => {
          const cat = world.cats["social-d"];
          if (cat === undefined) return;
          cat.rest = "sleep";
          setCatState(cat, "sleep");
        },
      },
      {
        at: 15.5,
        run: (world) => {
          const cat = world.cats["social-b"];
          if (cat !== undefined) startZoomies({ world, cat });
        },
      },
    ],
  },
} satisfies { [item: string]: GuideTake };

/** Start `kind` between `catId` and `partnerId` the way the sim's own social start does, without its random pick of kind. */
function startPair(options: {
  world: World;
  kind: "greet" | "chase" | "bat" | "snuggle";
  catId: string;
  partnerId: string;
}) {
  const cat = options.world.cats[options.catId];
  const partner = options.world.cats[options.partnerId];
  if (cat === undefined || partner === undefined) return;
  cat.partnerId = partner.userId;
  cat.focusId = undefined;
  switch (options.kind) {
    case "greet":
      cat.social = {
        kind: "greet",
        t: 0,
        sniffT: 0,
        sniffing: false,
        lead: true,
        printed: false,
      };
      partner.social = {
        kind: "greet",
        t: 0,
        sniffT: 0,
        sniffing: false,
        lead: false,
        printed: false,
      };
      partner.partnerId = cat.userId;
      partner.rest = undefined;
      setCatState(cat, "greet");
      setCatState(partner, "greet");
      break;
    case "chase":
      cat.social = { kind: "chase", t: 0, durationSeconds: 3.4 };
      partner.social = { kind: "chased", t: 0 };
      partner.partnerId = cat.userId;
      partner.rest = undefined;
      setCatState(cat, "chase");
      setCatState(partner, "chased");
      break;
    case "bat":
      cat.social = { kind: "bat", t: 0, durationSeconds: 6, phase: "go" };
      setCatState(cat, "bat");
      break;
    case "snuggle": {
      const gap = 85 * (cat.build.scale + partner.build.scale);
      cat.wander = {
        x: partner.x - Math.sin(partner.heading) * gap,
        y: partner.y + Math.cos(partner.heading) * gap,
      };
      cat.isSnuggling = true;
      setCatState(cat, "approach");
      break;
    }
    default: {
      const unknown: never = options.kind;
      return unknown;
    }
  }
}
