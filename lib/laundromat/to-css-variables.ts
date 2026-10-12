import { toTokenProperty } from "./to-token-property";

/** Return CSS custom property declarations for `tokens`, naming each `--lm-<kebab-case key>`. */
export function toCssVariables(tokens: { [name: string]: string }) {
  return Object.entries(tokens)
    .map(([name, value]) => `${toTokenProperty(name)}: ${value};`)
    .join(" ");
}
