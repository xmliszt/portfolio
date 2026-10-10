/** Return CSS custom property declarations for `tokens`, naming each `--lm-<kebab-case key>`. */
export function toCssVariables(tokens: { [name: string]: string }) {
  return Object.entries(tokens)
    .map(([name, value]) => {
      const kebabName = name.replace(
        /[A-Z]|\d+/g,
        (part) => `-${part.toLowerCase()}`
      );
      return `--lm-${kebabName}: ${value};`;
    })
    .join(" ");
}
