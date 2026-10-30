/** Paper and inks shared by the canvas and the interface; nothing on the page uses any other colour. */
export const RISO = {
  paper: "#f3efe4",
  paperDeep: "#ebe5d6",
  ink: "#2b3a63",
  inkSoft: "#5d6688",
  orange: "#e0662f",
  pink: "#d9577f",
  blue: "#2c68b2",
  yellow: "#ffd03a",
  rule: "#d8d0bd",
} as const;

/** The same paper and inks as CSS custom properties, for the `style` of the page root. */
export const RISO_CSS_VARIABLES = {
  "--gp-paper": RISO.paper,
  "--gp-paper-deep": RISO.paperDeep,
  "--gp-ink": RISO.ink,
  "--gp-ink-soft": RISO.inkSoft,
  "--gp-orange": RISO.orange,
  "--gp-pink": RISO.pink,
  "--gp-blue": RISO.blue,
  "--gp-yellow": RISO.yellow,
  "--gp-rule": RISO.rule,
} as const;
