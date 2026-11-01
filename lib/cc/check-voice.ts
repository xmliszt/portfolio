import sortBy from "lodash/sortBy.js";

import { VOICE_RULES, type VoiceMatcher, type VoiceSpan } from "./voice-rules";

type VoiceFlag = {
  ruleId: string;
  start: number;
  end: number;
  label: string;
  reason: string;
};

function findPatternSpans(options: { text: string; pattern: RegExp }) {
  return Array.from(options.text.matchAll(options.pattern)).map((match) => ({
    start: match.index ?? 0,
    end: (match.index ?? 0) + match[0].length,
  }));
}

function findSpans(options: {
  matcher: VoiceMatcher;
  text: string;
  maxHashtags: number;
}): VoiceSpan[] {
  const matcher = options.matcher;
  switch (matcher.kind) {
    case "pattern":
      return findPatternSpans({ text: options.text, pattern: matcher.pattern });
    case "pattern-min-count": {
      const spans = findPatternSpans({
        text: options.text,
        pattern: matcher.pattern,
      });
      return spans.length >= matcher.minCount ? spans : [];
    }
    case "custom":
      return matcher.find({
        text: options.text,
        maxHashtags: options.maxHashtags,
      });
    default: {
      const unhandled: never = matcher;
      return unhandled;
    }
  }
}

/** Return every `VOICE_RULES` hit in `text`, sorted by position. */
export function checkVoice(options: { text: string; maxHashtags: number }) {
  const flags = VOICE_RULES.flatMap((rule): VoiceFlag[] =>
    findSpans({
      matcher: rule.matcher,
      text: options.text,
      maxHashtags: options.maxHashtags,
    }).map((span) => ({
      ruleId: rule.id,
      start: span.start,
      end: span.end,
      label: rule.label,
      reason: rule.reason,
    }))
  );
  return sortBy(flags, ["start", "end"]);
}
