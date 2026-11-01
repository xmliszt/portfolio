import type { drawScene } from "@/lib/paws/render/draw-scene";

/** What the room drew on its last frame, in CSS pixels of the window, so the camera can draw the same moment again at photo size. */
export type RoomScene = Omit<
  Parameters<typeof drawScene>[0],
  "g" | "dpr" | "resources"
>;
