import type { CatLook } from "./cat-look";
import type { VoiceSettings } from "./voice-settings";

export type SavedCat = {
  look: CatLook;
  voice: VoiceSettings;
  meowUrl: string;
  hasOwnMeow: boolean;
};

export type GetCatResponse = { kind: "found"; cat: SavedCat } | { kind: "none" } | { kind: "signInRequired" };

export type PutCatRequest = { look: CatLook; voice: VoiceSettings };

export type PutCatResponse = { kind: "saved"; cat: SavedCat } | { kind: "invalid" } | { kind: "signInRequired" };
