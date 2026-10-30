/** Return `template` with each `{name}` replaced by `values[name]`, leaving unknown names as they are. */
export function fillCopy(options: {
  template: string;
  values: { [name: string]: string };
}) {
  return options.template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(options.values, name) ? options.values[name] : match
  );
}
