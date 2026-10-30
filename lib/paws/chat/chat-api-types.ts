import type { ChatMessage } from "@/lib/paws/wire-types";

export type ChatRequest = { roomId: string; text: string };

export type ChatResponse =
  | { kind: "sent"; message: ChatMessage }
  | { kind: "refused" }
  | { kind: "tooFast" }
  | { kind: "notPlaying" }
  | { kind: "signInRequired" }
  | { kind: "invalid" }
  | { kind: "failed" };
