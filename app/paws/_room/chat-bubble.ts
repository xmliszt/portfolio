import type { RevealStep } from "@/lib/paws/chat/get-reveal-steps";
import type { ChatMessage } from "@/lib/paws/wire-types";

/** One cat's line on screen: the line, the coat ink its bubble is outlined in, and when each part of it shows. */
export type ChatBubble = {
  message: ChatMessage;
  accent: string;
  reveal: RevealStep[];
};
