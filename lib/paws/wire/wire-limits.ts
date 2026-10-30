import { ROOM_LIMITS } from "@/lib/paws/room-limits";

const WORLD_MARGIN = 200;

/** Bounds every received message is held to: world positions with a margin past each edge, and the longest ids, URLs and finger trails kept. */
export const WIRE_LIMITS = {
  minX: -WORLD_MARGIN,
  maxX: ROOM_LIMITS.worldWidth + WORLD_MARGIN,
  minY: -WORLD_MARGIN,
  maxY: ROOM_LIMITS.worldHeight + WORLD_MARGIN,
  maxIdLength: 64,
  maxUrlLength: 512,
  maxTrailPoints: 12,
} as const;
