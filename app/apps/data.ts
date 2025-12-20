export type AppIcon = {
  light: string;
  dark: string;
  alt: string;
};

export type IconName =
  | "Storefront"
  | "ArrowSquareOut"
  | "ChatCircleDots"
  | "DiscordLogo"
  | "TwitterLogo"
  | "Envelope";

export type AppLink = {
  label: string;
  url: string;
  icon: IconName;
  description?: string;
  badge?: "pending" | "new" | "featured";
};

export type AppData = {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  icon: AppIcon;
  features: string[];
  links: {
    appStore?: AppLink[];
    feedback?: AppLink[];
    community?: AppLink[];
  };
  screenshots?: string[];
  appClipUrl?: string;
};

const apps: Record<string, AppData> = {
  joodle: {
    id: "joodle",
    name: "Joodle",
    subtitle: "Tiny Doodles, Big Memories",
    description:
      "Draw a doodle each day to capture your memories. Watch a year of your life unfold in a quiet, personal visual timeline.",
    icon: {
      light:
        "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20Icon%20Light.jpg",
      dark: "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/Joodle%20Icon%20Dark.jpg",
      alt: "Joodle App Icon",
    },
    features: [
      "Daily Joodle Journal: Capture moods, moments, or thoughts with a simple doodle in just seconds.",
      "Year Grid View: See your entire year at a glance through a grid of Joodle thumbnails—each one a day remembered.",
      "Anniversary Countdown: Add future dates and count down to moments that matter. Set reminders so you never miss an important day.",
      "Widgets: Bring your Joodles to your Home Screen, Lock Screen, or even StandBy mode.",
      "iCloud Sync: Keep your memories safe and seamlessly synced across all your Apple devices.",
      "Visual Timeline: Watch your Joodles come together into a meaningful story over time.",
      "Share Your Memories: Export Joodles individually or your entire year. Share thoughtfully, or keep your memories close.",
      "Vibrant Color Themes: Customize Joodle to match your personal style and mood.",
      "Siri Shortcuts: Access Joodle quickly from your search bar or via Siri.",
      "For Everyone, No Skills Required: Joodle isn’t about perfect art—it’s about capturing feelings. Even simple stick figures become a visual diary that’s deeply personal and uniquely yours.",
    ],
    screenshots: [
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS1.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS2.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS3.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS4.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS5.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS6.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS7.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS8.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS9.png",
      "https://aikluwlsjdrayohixism.supabase.co/storage/v1/object/public/joodle/For%20Official%20Reviews/SS10.png",
    ],
    links: {
      appStore: [
        {
          label: "Download on App Store",
          url: "#", // Placeholder for App Store link (pending review)
          icon: "Storefront",
          badge: "pending",
          description: "Available soon on the App Store",
        },
      ],
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
          label: "Discord Community",
          url: "https://discord.gg/9QUWBJ3p",
          icon: "DiscordLogo",
          description: "Meet like-minded people",
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
