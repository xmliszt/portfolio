import { ROOM_LIMITS } from "@/lib/paws/room-limits";

const WORLD_MARGIN = 200;

/** Bounds every received message is held to: world positions with a margin past each edge, and the longest ids, finger trails and chat lines kept. */
export const WIRE_LIMITS = {
  minX: -WORLD_MARGIN,
  maxX: ROOM_LIMITS.worldWidth + WORLD_MARGIN,
  minY: -WORLD_MARGIN,
  maxY: ROOM_LIMITS.worldHeight + WORLD_MARGIN,
  maxIdLength: 64,
  maxTrailPoints: 12,
  maxChatLength: 60,
} as const;
