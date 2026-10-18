export type ShareStep =
  | "paste-in-post"
  | "paste-in-chat"
  | "paste-in-new-post"
  | "pick-from-downloads";

/** The platforms the polaroid offers, in display order, with what the visitor does once the platform opens. */
export const SHARE_TARGETS = [
  { id: "instagram", label: "Instagram", step: "pick-from-downloads" },
  { id: "x", label: "X", step: "paste-in-post" },
  { id: "facebook", label: "Facebook", step: "paste-in-new-post" },
  { id: "threads", label: "Threads", step: "paste-in-post" },
  { id: "bluesky", label: "Bluesky", step: "paste-in-post" },
  { id: "mastodon", label: "Mastodon", step: "paste-in-post" },
  { id: "telegram", label: "Telegram", step: "paste-in-chat" },
  { id: "whatsapp", label: "WhatsApp", step: "paste-in-chat" },
] as const satisfies { id: string; label: string; step: ShareStep }[];

export type ShareTargetId = (typeof SHARE_TARGETS)[number]["id"];
