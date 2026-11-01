import type { PlatformId } from "./platforms";

export type ResearchSource = {
  platform: PlatformId | "all";
  claim: string;
  url: string;
  checkedOn: string;
};

const CHECKED_ON = "2026-11-01";

/** The studies behind `RESEARCHED_WINDOWS`, one row per claim used. */
export const RESEARCH_SOURCES: readonly ResearchSource[] = [
  {
    platform: "instagram",
    claim:
      "Wednesday is the top day, then Thursday and Tuesday; peaks Thu 9 am, Wed noon and 6 pm ET (9.6M posts).",
    url: "https://buffer.com/resources/when-is-the-best-time-to-post-on-instagram/",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "all",
    claim:
      "Weekday mornings ET lead for X, LinkedIn and Instagram; Mon–Thu are the strongest Instagram days.",
    url: "https://sproutsocial.com/insights/best-times-to-post-on-social-media/",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "linkedin",
    claim: "Tuesday and Thursday are best, Wednesday good; 8–10 am ET.",
    url: "https://www.socialpilot.co/insights/best-times-to-post-on-social-media",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "x",
    claim:
      "Tuesday and Wednesday are best, Thursday good; weekdays 9 am–3 pm ET.",
    url: "https://www.eclincher.com/articles/best-time-to-post-on-social-media-for-every-platform-in-2026",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "threads",
    claim: "Wednesday, Thursday and Tuesday mornings ET do best.",
    url: "https://iqfluence.io/public/blog/best-times-to-post-on-social-media",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "tiktok",
    claim:
      "Sources disagree (Saturday; Tue/Thu; Mon–Thu evenings); Sunday 9 am ET is noted by Buffer.",
    url: "https://postplanify.com/blog/best-time-to-post-on-social-media",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "producthunt",
    claim:
      "Launches go live at 00:01 PT (16:01 SGT); Tuesday to Thursday get the most traffic.",
    url: "https://postfa.st/blog/best-time-to-post-on-social-media",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "reddit",
    claim:
      "Weekday mornings ET 6–11 am, Tuesday and Wednesday slightly higher.",
    url: "https://www.redditapis.com/blogs/best-time-to-post-on-reddit-2026",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "reddit",
    claim: "Weekday mornings ET work best; post to one subreddit per day.",
    url: "https://www.webtonic.io/blog/best-times-to-post-on-reddit-for-maximum-engagement",
    checkedOn: CHECKED_ON,
  },
  {
    platform: "xiaohongshu",
    claim:
      "Weekends beat weekdays for low-follower accounts (2023 report); 情感 and 娱乐 peak 21:00–23:00, also 07:00–09:00.",
    url: "https://www.digitaling.com/articles/1432997.html",
    checkedOn: CHECKED_ON,
  },
];
