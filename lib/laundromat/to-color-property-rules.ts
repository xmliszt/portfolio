import { toTokenProperty } from "./to-token-property";

/** Return `@property` rules that register each of `tokens` as an inherited colour starting at its value, so its custom property can transition. */
export function toColorPropertyRules(tokens: { [name: string]: string }) {
  return Object.entries(tokens)
    .map(
      ([name, value]) =>
        `@property ${toTokenProperty(name)} { syntax: "<color>"; inherits: true; initial-value: ${value}; }`
    )
    .join("\n");
}
