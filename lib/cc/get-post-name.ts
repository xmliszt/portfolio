const MAX_LENGTH = 60;

/** Return a post's `title`, or its first non-blank line of `body` when it has none, cut to 60 characters. */
export function getPostName(options: { title: string | null; body: string }) {
  const name =
    options.title ??
    options.body.split("\n").find((line) => line.trim() !== "") ??
    "";
  return name.length > MAX_LENGTH ? `${name.slice(0, MAX_LENGTH)}…` : name;
}
