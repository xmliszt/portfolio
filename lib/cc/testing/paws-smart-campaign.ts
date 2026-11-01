/** The Paws launch as smart campaign input: product, the owner's words and the start of the maker's note from `campaigns.notes`. */
export const PAWS_SMART_CAMPAIGN = {
  product: { name: "Paws", link: "https://paws.garden" },
  thoughts:
    "Strangers meet through their cats, behind a frosted layer. Hazier feels truer. I want it to feel soft and relaxing, a place to slow down.",
  makersNote:
    "I've always found something quietly beautiful about the little encounters we have with strangers.\n\nWe don't always need to know each other, or even know who the other person is. Sometimes, we only cross paths for a brief moment, perhaps with a thin layer of frosted glass between us, and yet somehow, we can still feel each other's presence.\n\nThat's something I kept thinking about while making Paws.",
  startDate: "2026-11-03",
  lengthDays: 14,
  media: {
    promo: true,
    features: true,
    images: true,
    notes: "Promo in 16x9, 9x16 and 3x4-zh; features in 16x9.",
  },
} as const;

/** A ChatGPT reply in the shape the smart campaign prompt asks for, with prose around the block, written from the Paws launch copy. */
export const PAWS_CHATGPT_REPLY = `Here are all the posts for the Paws launch, in your voice:

\`\`\`json
{
  "campaign": {
    "name": "Paws launch",
    "tagline": "Meet strangers through their cats, behind frosted glass"
  },
  "posts": [
    {
      "ref": "x-1",
      "platform": "x",
      "wave": 1,
      "kind": "post",
      "language": "en",
      "body": "I made a small room on the Internet where strangers meet through their cats 🐾\\n\\nYou look up at them through frosted glass, so everything is soft and hazy. I've always felt some things are more real when you can't see every detail. Maybe people are too.",
      "hashtags": [],
      "media": "promo",
      "why": "The why first, then the room."
    },
    {
      "ref": "x-1-reply-1",
      "platform": "x",
      "wave": 1,
      "kind": "reply",
      "parent_ref": "x-1",
      "language": "en",
      "body": "Come and meet the cats: paws.garden",
      "hashtags": [],
      "media": "none",
      "why": "The link, kept out of the main post."
    },
    {
      "ref": "xiaohongshu-1",
      "platform": "xiaohongshu",
      "wave": 1,
      "kind": "post",
      "language": "zh",
      "title": "隔着磨砂玻璃，和陌生人的猫见一面🐾",
      "body": "我一直觉得，人与人之间有些很奇妙的相遇。\\n\\n于是就有了 Paws，一间小小的、毛绒绒的房间。\\n\\n免费，18 种语言 👉 paws.garden",
      "hashtags": ["数字艺术", "孔版印刷", "猫", "独立开发"],
      "media": "promo",
      "why": "用创作者的话开头。"
    },
    {
      "ref": "linkedin-1",
      "platform": "linkedin",
      "wave": 1,
      "kind": "post",
      "language": "en",
      "body": "I made a small room on the Internet where strangers meet through their cats.\\n\\nI love Impressionist paintings and the grain of risograph prints. Things feel more real to me when I can't see every detail, and I wonder if meeting people is like that too.",
      "hashtags": ["digitalart", "creativecoding", "indiedev"],
      "media": "promo",
      "why": "A maker's note for a work feed."
    },
    {
      "ref": "linkedin-1-comment",
      "platform": "linkedin",
      "wave": 1,
      "kind": "comment",
      "parent_ref": "linkedin-1",
      "language": "en",
      "body": "It's free, in 18 languages: https://paws.garden",
      "hashtags": [],
      "media": "none"
    },
    {
      "ref": "producthunt-1",
      "platform": "producthunt",
      "wave": 1,
      "kind": "post",
      "language": "en",
      "title": "Meet strangers through their cats, behind frosted glass",
      "body": "Paws is a small piece of digital art about the brief encounters we have with strangers. Look up at a room of other people's cats through frosted glass, and maybe one wanders over and presses its paw to your fingertip.",
      "hashtags": [],
      "media": "images",
      "why": "Art first, then what you can do."
    },
    {
      "ref": "producthunt-1-comment",
      "platform": "producthunt",
      "wave": 1,
      "kind": "comment",
      "parent_ref": "producthunt-1",
      "language": "en",
      "body": "Hi Product Hunt :)\\n\\nI've always found something quietly beautiful about the little encounters we have with strangers. Thank you for being here 🐾",
      "hashtags": [],
      "media": "none"
    }
  ]
}
\`\`\`
`;
