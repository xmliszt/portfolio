export const SOUND_NAMES = [
  "door-latch-open",
  "door-latch-close",
  "start-button",
  "knob-click",
  "coffee-switch",
  "page-flip",
  "notebook-open",
  "collect-laundry",
  "done-ding",
  "room-door-open",
  "door-locked",
  "tv-static",
  "coffee-brew-done",
  "notebook-free",
  "sliding-door",
  "lamp-flicker",
  "lamp-off",
  "coffee-beep",
  "coffee-pour",
  "coffee-sip",
  "touch-grass",
  "shop-bell",
  "thunder-rumble",
  "printer-feed",
] as const;

export type SoundName = (typeof SOUND_NAMES)[number];

export const LOOP_NAMES = [
  "washer-running",
  "dryer-running",
  "coffee-brewing",
  "tv-no-signal",
  "rain-outside",
  "printer-motor",
] as const;

export type LoopName = (typeof LOOP_NAMES)[number];
