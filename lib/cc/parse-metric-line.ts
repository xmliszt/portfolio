import type { MetricField } from "./platforms";

type MetricValues = { [field in MetricField]?: number | undefined };

type ParsedMetricLine =
  | { kind: "ok"; values: MetricValues }
  | { kind: "undo" }
  | { kind: "error"; reason: string };

const SKIP_TOKENS = ["-", "_", "—"];

const MULTIPLIERS: { [suffix: string]: number } = {
  "": 1,
  k: 1_000,
  m: 1_000_000,
  w: 10_000,
  万: 10_000,
};

function parseToken(token: string) {
  if (SKIP_TOKENS.includes(token)) {
    return { kind: "skip" } as const;
  }
  const match = /^#?(\d+(?:\.\d+)?)([kmw万]?)$/i.exec(token);
  const multiplier = match ? MULTIPLIERS[match[2].toLowerCase()] : undefined;
  if (!match || multiplier === undefined) {
    return { kind: "unreadable" } as const;
  }
  return {
    kind: "number",
    value: Math.round(Number(match[1]) * multiplier),
  } as const;
}

/** Parse one reply line of numbers into `fields` in order, or recognise `undo`. */
export function parseMetricLine(options: {
  line: string;
  fields: readonly MetricField[];
}): ParsedMetricLine {
  const line = options.line.trim();
  if (line.toLowerCase() === "undo") {
    return { kind: "undo" };
  }
  const tokens = line
    .replace(/(\d),(?=\d{3}(?!\d))/g, "$1")
    .split(/[\s,/，、]+/)
    .filter((token) => token !== "");
  if (tokens.length === 0) {
    return { kind: "error", reason: "No numbers in the reply." };
  }
  if (tokens.length > options.fields.length) {
    return {
      kind: "error",
      reason: `Got ${tokens.length} numbers, expected at most ${options.fields.length}.`,
    };
  }
  const parsed = tokens.map((token) => ({ token, result: parseToken(token) }));
  const unreadable = parsed.find((entry) => entry.result.kind === "unreadable");
  if (unreadable) {
    return {
      kind: "error",
      reason: `Can't read "${unreadable.token}".`,
    };
  }
  const values: MetricValues = Object.fromEntries(
    options.fields.map((field, index) => {
      const result = parsed.at(index)?.result;
      return [field, result?.kind === "number" ? result.value : undefined];
    })
  );
  return { kind: "ok", values };
}
