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

export type CatsMessage = {
  hostId: string;
  sentAt: number;
  cats: CatSnapshot[];
  prints: PawPrintEvent[];
};

export type PawPrintEvent = Extract<RoomEvent, { kind: "pawPrint" }>;

export type RoomEvent =
  | { kind: "sound"; userId: string; sound: "meow" | "trill" | "purr" | "lick" }
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
    };
