import { type PlatformId, PLATFORMS } from "./platforms";

/** Return the critique prompt for ChatGPT, written in `language`, or for a `repost` a prompt asking for a new opening on the original's idea. */
export function buildChatgptPrompt(options: {
  product: string;
  makersNote: string;
  platformId: PlatformId;
  limitRule: string;
  audience: string;
  assets: readonly string[];
  draft: string;
  language: "en" | "zh";
  repost: { original: string; how: string } | undefined;
}) {
  const platform = PLATFORMS[options.platformId].label;
  const repost = options.repost;
  switch (options.language) {
    case "en":
      return `I'm Yuxuan. I make small things on the Internet. I'm about to post about ${options.product}, and I want it to sound like me, not like marketing and not like AI.

Why I made it, in my own words:
${options.makersNote}

Platform: ${platform}. Limit: ${options.limitRule}.
Who reads it there: ${options.audience}.
It goes out with: ${options.assets.join(", ")}.

${
  repost === undefined
    ? ""
    : `This is a repost of a post that did well. The original:
"""
${repost.original}
"""
How to repost on ${platform}: ${repost.how}

`
}My draft:
"""
${options.draft}
"""

${
  repost === undefined
    ? `Please read it the way a friend who loves poems would:
1. Tell me in two or three sentences what feeling comes through and what gets lost.
2. Point to any line that sounds generic, salesy or AI-written, and say why.
3. Give me one rewrite that keeps my voice and fits the limit. Keep the why before the features. No em dashes, no hashtags unless I had them.`
    : `Please give me a different opening on the same idea:
1. Three new first lines that say it a new way, none reusing the original's first line.
2. One full rewrite with the best of them that keeps my voice and fits the limit. No em dashes, no hashtags unless I had them.`
}`;
    case "zh":
      return `我是 Yuxuan，在网上做一些小东西。我准备发一条关于 ${options.product} 的帖子，希望它读起来像我自己写的，不像广告，也不像 AI。

我为什么做它，用我自己的话说：
${options.makersNote}

平台：${platform}。字数限制：${options.limitRule}。
那里的读者：${options.audience}。
一起发的素材：${options.assets.join("、")}。

${
  repost === undefined
    ? ""
    : `这是一条重发，原帖表现不错。原帖：
"""
${repost.original}
"""
在${platform}重发的方式：${repost.how}

`
}我的草稿：
"""
${options.draft}
"""

${
  repost === undefined
    ? `请像一个喜欢诗的朋友那样读它：
1. 用两三句话告诉我，读下来传达出了什么感受，又丢了什么。
2. 指出哪一句听起来空泛、像推销或像 AI 写的，并说明原因。
3. 给我一版改写，保留我的语气，并且不超过字数限制。先说为什么做，再说能做什么。不要用破折号；我原文没有话题标签的话，也不要加。`
    : `请给同一个想法换一个开头：
1. 写三个新的第一句，用新的方式说同一件事，不要沿用原帖的第一句。
2. 用其中最好的一句写一版完整改写，保留我的语气，并且不超过字数限制。不要用破折号；我原文没有话题标签的话，也不要加。`
}`;
    default: {
      const unhandled: never = options.language;
      return unhandled;
    }
  }
}
