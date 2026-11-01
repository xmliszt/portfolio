import type { ToyItemId } from "./sim/toy-items";
import type { CatLook } from "./cat-look";
import type { VoiceSettings } from "./voice-settings";

export type PlayerPresence = {
  userId: string;
  connectionId: string;
  look: CatLook;
  voice: VoiceSettings;
  joinedAt: number;
};

/** `[x, y, t]`: a fingertip position in world units and the sender's clock in milliseconds when it was there. */
export type FingerPoint = [number, number, number];

/** One visitor's fingertip in world units at sender time `t`, with the `trail` of earlier points since their last message, oldest first. */
export type FingerMessage = {
  userId: string;
  x: number;
  y: number;
  t: number;
  trail: FingerPoint[];
  pressed: boolean;
  seq: number;
};

/** One line a player's cat says, as the server broadcasts it after the room and rate checks. */
export type ChatMessage = { id: string; userId: string; text: string };

export type LegSnapshot = { x: number; y: number; h: number };

export type CatActivity =
  | "enter"
  | "approach"
  | "pause"
  | "settle"
  | "sit"
  | "sleep"
  | "sniff"
  | "paw"
  | "greet"
  | "chase"
  | "chased"
  | "bat"
  | "leave";

/** What the host knows about one cat; every screen derives the tail, outline and blur from it. */
export type CatSnapshot = {
  userId: string;
  x: number;
  y: number;
  heading: number;
  speed: number;
  bend: number;
  pose: { stand: number; sit: number; sleep: number };
  yaw: number;
  sniff: number;
  legs: [LegSnapshot, LegSnapshot, LegSnapshot, LegSnapshot];
  activity: CatActivity;
};

type ToyPlace = {
  id: string;
  x: number;
  y: number;
  /** Height above the glass, above 0 while it hops after a bat. */
  h: number;
  angle: number;
  /** Radians it has rolled, for the yarn's wraps. */
  spin: number;
};

/** Water a knocked bowl let out: where the puddle is and how many seconds ago it spilled. */
export type ToySpill = { x: number; y: number; seconds: number };

/** What the host knows about one toy in the room. */
export type ToySnapshot =
  | (ToyPlace & {
      kind: "yarn";
      /** 0–1 share of the thread still wound on the ball. */
      left: number;
      /** 0 until the ball is used up, then rising to 1 as its thread fades away. */
      fade: number;
    })
  | (ToyPlace & {
      kind: "roll";
      isStanding: boolean;
      /** World units of paper unrolled since it was knocked over. */
      unrolled: number;
      /** 0 until the paper runs out, then rising to 1 as the roll and its strip fade away. */
      fade: number;
    })
  | (ToyPlace & { kind: "bowl"; spill: ToySpill | undefined })
  | (ToyPlace & { kind: "box" });

/** The thread or paper strip a toy has laid on the glass, oldest point first, in whole world units. */
export type ToyTrail = { toyId: string; points: [number, number][] };

export type CatsMessage = {
  hostId: string;
  sentAt: number;
  cats: CatSnapshot[];
  prints: PawPrintEvent[];
  toys: ToySnapshot[];
  /** Every toy's trail, sent about once a second rather than with every message. */
  trails?: ToyTrail[];
};

export type PawPrintEvent = Extract<RoomEvent, { kind: "pawPrint" }>;

export type RoomEvent =
  | { kind: "sound"; userId: string; sound: "meow" | "purr" }
  | {
      kind: "pawPrint";
      userId: string;
      x: number;
      y: number;
      angle: number;
      leg: number;
    }
  | { kind: "nosePrint"; userId: string; x: number; y: number; angle: number }
  | {
      kind: "fingerPrint";
      userId: string;
      x: number;
      y: number;
      pressure: number;
    }
  | {
      kind: "placeToy";
      userId: string;
      itemId: ToyItemId;
      x: number;
      y: number;
    };
