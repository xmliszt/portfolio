/** A second laundro.cafe campaign as smart campaign input: a follow-up on the shared notebook, with the October launch described by hand because CC did not track it. */
export const LAUNDRO_FOLLOW_UP_CAMPAIGN = {
  kind: "follow-up",
  intent:
    "second campaign: focus on the shared notebook where strangers leave notes, and the late-night regulars; we already did the intro in October",
  eventDate: undefined,
  product: { name: "laundro.cafe", link: "https://laundro.cafe" },
  thoughts:
    "A quiet laundromat on the Internet that stays open late. You sit with strangers while the machines turn, and sometimes you leave a note in the notebook for whoever comes next.",
  makersNote: "",
  earlierPosts:
    "Oct 2026: launched on Product Hunt, X, Threads, 小红书 with a 60 s film; 小红书 did best",
  startDate: "2026-11-16",
  lengthDays: 14,
  media: {
    promo: true,
    features: false,
    images: true,
    notes:
      "The 60 s film from the October launch; screenshots of the notebook.",
    newMedia: "",
  },
  platforms: [
    { platformId: "x", language: "en" },
    { platformId: "threads", language: "en" },
    { platformId: "xiaohongshu", language: "zh" },
    { platformId: "linkedin", language: "en" },
    { platformId: "reddit", language: "en" },
  ],
} as const;
