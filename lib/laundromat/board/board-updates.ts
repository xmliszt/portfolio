export const BOARD_UPDATE_IDS = [
  "bedroom-curtains",
  "settings-lite",
  "door-bell",
  "whats-new-board",
  "twelve-stations",
  "page-drag",
  "window-light",
  "shared-coffee",
  "street-view",
  "tube-counter",
  "coffee-counter",
  "shared-machines",
  "eighteen-languages",
  "shared-notebook",
  "lofi-tv",
  "opening",
] as const;

export type BoardUpdateId = (typeof BOARD_UPDATE_IDS)[number];

export const BOARD_TAGS = [
  "opening",
  "tv",
  "notebook",
  "languages",
  "room",
  "coffee",
  "window",
  "light",
  "board",
] as const;

export type BoardTag = (typeof BOARD_TAGS)[number];

/** Every change the board can show, newest first, with its tag and the day it shipped as `YYYY-MM-DD`. */
export const BOARD_UPDATES = [
  { id: "bedroom-curtains", tag: "window", date: "2026-10-13" },
  { id: "settings-lite", tag: "room", date: "2026-10-13" },
  { id: "door-bell", tag: "room", date: "2026-10-13" },
  { id: "whats-new-board", tag: "board", date: "2026-10-13" },
  { id: "twelve-stations", tag: "tv", date: "2026-10-13" },
  { id: "page-drag", tag: "notebook", date: "2026-10-12" },
  { id: "window-light", tag: "light", date: "2026-10-12" },
  { id: "shared-coffee", tag: "coffee", date: "2026-10-12" },
  { id: "street-view", tag: "window", date: "2026-10-11" },
  { id: "tube-counter", tag: "room", date: "2026-10-11" },
  { id: "coffee-counter", tag: "coffee", date: "2026-10-11" },
  { id: "shared-machines", tag: "room", date: "2026-10-11" },
  { id: "eighteen-languages", tag: "languages", date: "2026-10-11" },
  { id: "shared-notebook", tag: "notebook", date: "2026-10-11" },
  { id: "lofi-tv", tag: "tv", date: "2026-10-11" },
  { id: "opening", tag: "opening", date: "2026-10-11" },
] satisfies { id: BoardUpdateId; tag: BoardTag; date: string }[];
