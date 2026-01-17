export type AppIcon = {
  light: string;
  dark: string;
  alt: string;
};

export type IconName =
  | "Storefront"
  | "TestFlight"
  | "ArrowSquareOut"
  | "ChatCircleDots"
  | "WhatsappLogo"
  | "TwitterLogo"
  | "Envelope";

export type AppLink = {
  label: string;
  url: string;
  icon: IconName;
  description?: string;
  badge?: "reviewing" | "available";
  badgeLabel?: string;
};

export type AppData = {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  icon: AppIcon;
  features: string[];
  links: {
    testFlight?: AppLink;
    appStore?: AppLink;
    feedback?: AppLink[];
    community?: AppLink[];
  };
  screenshots?: string[];
  appClipUrl?: string;
  keywords?: string[];
  ogImages?: string[];
  ogImagesTwitter?: string[];
  productHuntEmbed?: string;
  whatsappEmbed?: string;
};

const apps: Record<string, AppData> = {
  joodle: {
    id: "joodle",
    name: "Joodle: Journaling With Doodle",
    subtitle: "Visual Daily Journal",
    description:
      "Draw one simple doodle each day and remember your life as a visual timeline—not pages of text. Joodle is a private visual daily journal for capturing moments, moods, and memories in seconds.",
    keywords: [
      // Core identity
      "visual journal",
      "visual daily journal",
      "daily journal",
      "journal app",
      "journaling app",
      "diary app",
      "personal diary",
      "private journal",

      // Memory & reflection
      "memory journal",
      "visual memory journal",
      "life journal",
      "reflection journal",
      "self reflection journal",
      "mindfulness journal",
      "quiet journal",

      // Visual + format
      "doodle journal",
      "doodle journaling app",
      "daily doodle",
      "drawing journal",
      "visual diary",
      "visual journaling",
      "year in pixels",
      "year grid journal",
      "visual timeline",
      "memory timeline",

      // Mood & emotion (kept but focused)
      "mood journal",
      "mood tracker",
      "emotion journal",
      "feeling journal",

      // iOS intent
      "ios journal app",
      "iphone journal app",
      "ipad journal app",
      "icloud journal",
      "apple widgets journal",
      "lock screen journal",
      "standby mode widgets",

      // Brand
      "joodle",
      "joodle app",
      "joodle journal",
      "joodle diary",
      "visual journal app joodle",
    ],
    icon: {
      light:
        "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20Icon%20Light.jpg",
      dark: "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20Icon%20Dark.jpg",
      alt: "Joodle App Icon",
    },

    features: [
      "Daily Visual Journal: Draw one simple doodle each day to capture moods, moments, or feelings in seconds—no writing required.",
      "Year-at-a-Glance Memory Grid: See your entire year as a visual timeline of daily doodles, with each day remembered at a glance.",
      "Visual Memory Timeline: Watch your daily doodles come together into a quiet, personal story over time.",
      "Private by Design with iCloud Sync: Your journal stays on your devices and syncs securely across iPhone, iPad, and Apple devices.",
      "Widgets Everywhere: Bring your visual journal to your Home Screen, Lock Screen, or StandBy mode for quick daily access.",
      "Anniversary & Important Dates Countdown: Track birthdays, anniversaries, and meaningful moments with gentle reminders.",
      "Share Thoughtfully: Export individual days or your entire year—share selectively or keep everything private.",
      "Personal Themes & Colors: Customize your visual journal to match your mood and personal style.",
      "Quick Access with Siri Shortcuts: Open your daily journal instantly using search or voice.",
      "No Art Skills Required: Joodle isn’t about perfect drawings—simple stick figures become a deeply personal visual diary.",
    ],
    screenshots: [
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS1.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS2.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS3.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS4.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS5.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS6.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS7.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS8.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS9.jpeg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS10.jpeg",
    ],
    links: {
      // testFlight: {
      //   label: "Experience Beta on TestFlight",
      //   url: "https://testflight.apple.com/join/gHHMG72B",
      //   icon: "TestFlight",
      //   badge: "available",
      //   badgeLabel: "Try Beta on TestFlight",
      //   description: "Join the TestFlight program",
      // },
      appStore: {
        label: "Download on App Store",
        url: "https://apps.apple.com/sg/app/joodle-journaling-with-doodle/id6756204776", // Placeholder for App Store link (pending review)
        icon: "Storefront",
        badge: "available",
        badgeLabel: "GET",
        description: "Now available on the App Store!",
      },
      feedback: [
        {
          label: "Customer Feedback Form",
          url: "https://tinyurl.com/joodle-feedback",
          icon: "ChatCircleDots",
          description: "Share your feedback and suggestions",
        },
      ],
      community: [
        {
          label: "WhatsApp Community",
          url: "https://chat.whatsapp.com/FF2rMEiSOwe9hsRapSyvdY",
          icon: "WhatsappLogo",
          description: "Make friends and share your doodles",
        },
        {
          label: "X (Twitter)",
          url: "https://x.com/xmliszt",
          icon: "TwitterLogo",
          description: "Follow me for more updates",
        },
        {
          label: "Support Email",
          url: "mailto:joodle@liyuxuan.dev",
          icon: "Envelope",
          description: "Contact me for support and inquiries",
        },
      ],
    },
    ogImages: [
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20OG%20-%20Linkedin.jpg",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20OG.jpg",
    ],
    ogImagesTwitter: [
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20OG%20-%20Twitter.jpg",
    ],
    productHuntEmbed: `<a href="https://www.producthunt.com/products/joodle-journaling-with-doodle?embed=true&amp;utm_source=badge-top-post-badge&amp;utm_medium=badge&amp;utm_campaign=badge-joodle" target="_blank" rel="noopener noreferrer"><img alt="Joodle - Turn years of memories into personal doodles | Product Hunt" width="250" height="54" src="https://api.producthunt.com/widgets/embed-image/v1/top-post-badge.svg?post_id=1058014&amp;theme=light&amp;period=daily&amp;t=1767600498155"></a>`,
    whatsappEmbed: `<a href="https://chat.whatsapp.com/FF2rMEiSOwe9hsRapSyvdY" target="_blank" rel="noopener noreferrer"><img alt="Joodle: Journaling With Doodle - WhatsApp Community Invitation Link" width="268.457" height="54" src="https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Whatsapp%20Community%20Banner.png"></a>`,
  },
};

export function getAppById(id: string): AppData | undefined {
  return apps[id];
}

export function getAllAppIds(): string[] {
  return Object.keys(apps);
}

export function getAllApps(): AppData[] {
  return Object.values(apps);
}
