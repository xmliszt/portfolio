const YARN_COLORS = {
  "yarn-1": { body: "#d9577f", strand: "#b03d66" },
  "yarn-2": { body: "#3f7fc4", strand: "#2c5a96" },
  "yarn-3": { body: "#f0b53a", strand: "#c4861a" },
  "yarn-4": { body: "#4f9a6e", strand: "#2f7350" },
  "yarn-5": { body: "#8a6bb8", strand: "#634793" },
} as const;

/** Return the wool colour of the yarn ball `toyId` and the darker colour of its strands, the first ball's pink for an id outside the five. */
export function getYarnColors(toyId: string) {
  return isYarnId(toyId) ? YARN_COLORS[toyId] : YARN_COLORS["yarn-1"];
}

function isYarnId(toyId: string): toyId is keyof typeof YARN_COLORS {
  return toyId in YARN_COLORS;
}
