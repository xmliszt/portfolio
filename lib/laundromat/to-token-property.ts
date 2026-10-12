/** Return the CSS custom property name for the scene token `name`: `--lm-` plus its kebab-case form, digits split off (`wall2` is `--lm-wall-2`). */
export function toTokenProperty(name: string) {
  return `--lm-${name.replace(/[A-Z]|\d+/g, (part) => `-${part.toLowerCase()}`)}`;
}
