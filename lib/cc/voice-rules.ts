export type VoiceSpan = { start: number; end: number };

export type VoiceMatcher =
  | { kind: "pattern"; pattern: RegExp }
  | { kind: "pattern-min-count"; pattern: RegExp; minCount: number }
  | {
      kind: "custom";
      find: (input: { text: string; maxHashtags: number }) => VoiceSpan[];
    };

export type VoiceRule = {
  id: string;
  label: string;
  reason: string;
  /** The rule as one line for ChatGPT, in the rule's `language`. */
  instruction: string;
  language: "en" | "zh";
  matcher: VoiceMatcher;
};

const BROETRY_MIN_LINES = 5;
const BROETRY_MAX_LINE_WEIGHT = 50;

const ENGLISH_WORD = String.raw`(?!(?:and|or)\b)[\p{L}'’-]+`;
const ENGLISH_TRIPLET_ITEM = String.raw`${ENGLISH_WORD}(?: ${ENGLISH_WORD}){0,2}`;
const ENGLISH_SHORT_TRIPLET_ITEM = String.raw`${ENGLISH_WORD}(?: ${ENGLISH_WORD})?`;
const CHINESE_TRIPLET_ITEM = String.raw`\p{Script=Han}{1,4}`;

function getLineWeight(line: string) {
  return Array.from(line).reduce(
    (sum, character) => sum + (/\p{Script=Han}/u.test(character) ? 2 : 1),
    0
  );
}

function isBroetryLine(line: string) {
  const trimmed = line.trim();
  const hasInnerSentenceBreak = /[.!?。！？]\s*\S/u.test(
    trimmed.replace(/[.!?。！？]+$/u, "")
  );
  return (
    trimmed !== "" &&
    getLineWeight(trimmed) <= BROETRY_MAX_LINE_WEIGHT &&
    !hasInnerSentenceBreak
  );
}

function findBroetry(input: { text: string }) {
  const lines = input.text.split("\n").reduce<VoiceSpan[]>((spans, line) => {
    const start = (spans.at(-1)?.end ?? -1) + 1;
    return [...spans, { start, end: start + line.length }];
  }, []);
  const runs = lines.reduce<VoiceSpan[][]>(
    (result, span) => {
      const line = input.text.slice(span.start, span.end);
      if (line.trim() === "") {
        return result;
      }
      if (!isBroetryLine(line)) {
        return [...result, []];
      }
      const current = result.at(-1) ?? [];
      return [...result.slice(0, -1), [...current, span]];
    },
    [[]]
  );
  return runs.flatMap((run) => {
    const first = run.at(0);
    const last = run.at(-1);
    return run.length >= BROETRY_MIN_LINES && first && last
      ? [{ start: first.start, end: last.end }]
      : [];
  });
}

function findExtraHashtags(input: { text: string; maxHashtags: number }) {
  return Array.from(
    input.text.matchAll(/(?<![\p{L}\p{N}_&])#[\p{L}_][\p{L}\p{N}_]*/gu)
  )
    .slice(input.maxHashtags)
    .map((match) => ({
      start: match.index ?? 0,
      end: (match.index ?? 0) + match[0].length,
    }));
}

export const VOICE_RULES: readonly VoiceRule[] = [
  {
    id: "em-dash",
    label: "Em dash",
    reason:
      "Readers now treat the em dash as the most common AI tell. Use two sentences or a comma.",
    instruction:
      "No em dashes (—), and no spaced hyphen used as one. Use two sentences or a comma.",
    language: "en",
    matcher: {
      kind: "pattern",
      pattern: /(?<!—)—(?!—)|(?<=\S)[^\S\n]-[^\S\n](?=\S)/g,
    },
  },
  {
    id: "not-x-its-y",
    label: '"Not X, it\'s Y"',
    reason: "A stock contrast formula.",
    instruction: "No \"it's not X, it's Y\" contrasts.",
    language: "en",
    matcher: {
      kind: "pattern",
      pattern:
        /\b(?:(?:it|this|that|they|we|you)(?:['’]s|['’]re| is| are)\s+not|isn['’]t|aren['’]t)\s+[^.!?\n]{1,60}?[,;.—–]\s*(?:it|this|that|they|we|you)(?:['’]s|['’]re| is| are)\b/gi,
    },
  },
  {
    id: "triplet",
    label: "List of three",
    reason: "Rhythmic triplets are a default AI cadence.",
    instruction:
      'No lists of three adjectives or clauses ("soft, slow and quiet").',
    language: "en",
    matcher: {
      kind: "pattern-min-count",
      pattern: new RegExp(
        String.raw`(?<![\p{L}'’-])${ENGLISH_TRIPLET_ITEM}, ${ENGLISH_TRIPLET_ITEM},? (?:and|or) ${ENGLISH_TRIPLET_ITEM}(?![\p{L}'’-])|(?<![\p{L}'’-])${ENGLISH_SHORT_TRIPLET_ITEM}, ${ENGLISH_SHORT_TRIPLET_ITEM}, ${ENGLISH_SHORT_TRIPLET_ITEM}(?=[.!?\n]|$)`,
        "giu"
      ),
      minCount: 2,
    },
  },
  {
    id: "stock-opener",
    label: "Stock opener",
    reason: "A template hook.",
    instruction:
      'No template openers: "In a world where", "Ever wondered", "Imagine", "Here\'s the thing".',
    language: "en",
    matcher: {
      kind: "pattern",
      pattern:
        /^[^\S\n]*(?:in a world where|(?:have you )?ever wondered|imagine\b|here['’]s the thing)/gim,
    },
  },
  {
    id: "stock-closer",
    label: "Stock closer",
    reason: "A template ending.",
    instruction:
      'No template closers: "Let\'s dive in", "The best part?", "And that\'s the magic", "Give it a try".',
    language: "en",
    matcher: {
      kind: "pattern",
      pattern:
        /\b(?:let['’]s dive in|the best part\?|and that['’]s the magic|give it a try)/gi,
    },
  },
  {
    id: "hype-word",
    label: "Hype word",
    reason: "Marketing filler, and off-brand for Paws.",
    instruction:
      "No hype words: revolutionary, immersive, game-changer, seamless, unlock, elevate, delve, tapestry, testament, journey, cozy digital sanctuary, meaningful connections.",
    language: "en",
    matcher: {
      kind: "pattern",
      pattern:
        /\b(?:revolutionary|immersive|game[- ]changers?|seamless(?:ly)?|unlock(?:s|ed|ing)?|elevat(?:e|es|ed|ing)|delv(?:e|es|ed|ing)|tapestry|testament|journeys?|cozy digital sanctuary|meaningful connections?)\b/gi,
    },
  },
  {
    id: "hedged-grandeur",
    label: "Hedged grandeur",
    reason: "Inflated framing.",
    instruction:
      'No inflated framing: "a celebration of", "a love letter to", "more than just".',
    language: "en",
    matcher: {
      kind: "pattern",
      pattern: /\b(?:a celebration of|a love letter to|more than just)\b/gi,
    },
  },
  {
    id: "broetry",
    label: "Broetry",
    reason: `One short sentence per line for ${BROETRY_MIN_LINES}+ lines is an engagement-bait layout.`,
    instruction: `No one short sentence per line for ${BROETRY_MIN_LINES} lines or more.`,
    language: "en",
    matcher: { kind: "custom", find: findBroetry },
  },
  {
    id: "hashtag-stuffing",
    label: "Too many hashtags",
    reason:
      "More hashtags than the platform's pre-flight count looks automated.",
    instruction: "No more hashtags than the platform allows below.",
    language: "en",
    matcher: { kind: "custom", find: findExtraHashtags },
  },
  {
    id: "exclamations",
    label: "Exclamation marks",
    reason: "Two or more in one post reads as forced enthusiasm.",
    instruction: "At most one exclamation mark in a post.",
    language: "en",
    matcher: { kind: "pattern-min-count", pattern: /!/g, minCount: 2 },
  },
  {
    id: "zh-big-words",
    label: "空泛大词",
    reason: "套话，承诺太满。",
    instruction:
      "不要空泛大词：治愈每一个孤独的灵魂、重新定义、沉浸式、颠覆、赋能、极致体验。",
    language: "zh",
    matcher: {
      kind: "pattern",
      pattern:
        /治愈每一个|孤独的灵魂|重新定义|沉浸式|颠覆|赋能|极致体验|灵魂的栖息地|心灵的港湾/gu,
    },
  },
  {
    id: "zh-triplet",
    label: "排比三连",
    reason: "三个并列的词，机器腔节奏。",
    instruction: "不要排比三连（温暖、柔软、治愈）。",
    language: "zh",
    matcher: {
      kind: "pattern-min-count",
      pattern: new RegExp(
        String.raw`(?<!\p{Script=Han})${CHINESE_TRIPLET_ITEM}、${CHINESE_TRIPLET_ITEM}、${CHINESE_TRIPLET_ITEM}(?!\p{Script=Han})`,
        "gu"
      ),
      minCount: 2,
    },
  },
  {
    id: "zh-stock-opener",
    label: "模板开头",
    reason: "模板化的开头。",
    instruction: "不要模板开头：你有没有想过、你是否也曾、在这个快节奏的时代。",
    language: "zh",
    matcher: {
      kind: "pattern",
      pattern: /你有没有想过|你是否也曾|在这个[^，。！？\n]{0,8}的时代/gu,
    },
  },
  {
    id: "zh-stock-closer",
    label: "模板结尾",
    reason: "模板化的结尾。",
    instruction: "不要模板结尾：快来试试吧、你还在等什么、赶紧冲。",
    language: "zh",
    matcher: {
      kind: "pattern",
      pattern: /快来试试吧|你还在等什么|还在等什么|赶紧冲/gu,
    },
  },
  {
    id: "zh-dash",
    label: "破折号滥用",
    reason: "破折号用了两次以上，是常见的 AI 痕迹。",
    instruction: "破折号（——）最多用一次。",
    language: "zh",
    matcher: { kind: "pattern-min-count", pattern: /——/g, minCount: 2 },
  },
  {
    id: "zh-exclamation-stack",
    label: "感叹号堆叠",
    reason: "用力过猛。",
    instruction: "不要连用感叹号（！！）。",
    language: "zh",
    matcher: { kind: "pattern", pattern: /[！!]{2,}/g },
  },
];
