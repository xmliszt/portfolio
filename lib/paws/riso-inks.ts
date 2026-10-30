/** Paper and interface inks shared by the canvas and the controls. */
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
  "--pw-paper": RISO.paper,
  "--pw-paper-deep": RISO.paperDeep,
  "--pw-ink": RISO.ink,
  "--pw-ink-soft": RISO.inkSoft,
  "--pw-orange": RISO.orange,
  "--pw-pink": RISO.pink,
  "--pw-blue": RISO.blue,
  "--pw-yellow": RISO.yellow,
  "--pw-rule": RISO.rule,
} as const;
