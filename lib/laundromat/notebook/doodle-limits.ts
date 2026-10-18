/** The most one doodle may hold, shared by the drawing pad, every drawing parser, and `append_doodle`. */
export const DOODLE_LIMITS = {
  maxStrokes: 300,
  maxPoints: 2000,
  maxStrokeMs: 20_000,
} as const;
