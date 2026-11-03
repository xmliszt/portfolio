import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Metadata, Viewport } from "next";
import { cookies } from "next/headers";

import { CC_ORIGIN } from "@/lib/cc/cc-hosts";
import { CC_THEME_COOKIE } from "@/lib/cc/theme/cc-theme";
import { parseThemePreference } from "@/lib/cc/theme/parse-theme-preference";
import { resolveTheme } from "@/lib/cc/theme/resolve-theme";
import { cn } from "@/lib/utils";

import { CcThemeRoot } from "./_ui/cc-theme-root";

import "./cc-theme.css";

const DESCRIPTION =
  "A private command center for planning, posting and tracking social posts.";

export const metadata: Metadata = {
  metadataBase: new URL(CC_ORIGIN),
  title: { default: "CC//", template: "%s · CC//" },
  description: DESCRIPTION,
  applicationName: "CC//",
  manifest: "/cc/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/cc/icon.svg", type: "image/svg+xml" },
      { url: "/cc/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/cc/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/cc/apple-touch-icon.png",
  },
  appleWebApp: { title: "CC//", statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "CC//",
    title: "CC//",
    description: DESCRIPTION,
    images: [
      { url: "/cc/og-image.png", width: 1200, height: 630, alt: "CC//" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CC//",
    description: DESCRIPTION,
    images: ["/cc/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export async function generateViewport(): Promise<Viewport> {
  const theme = resolveTheme({
    preference: parseThemePreference(
      (await cookies()).get(CC_THEME_COOKIE)?.value
    ),
    now: new Date(),
  });
  return {
    themeColor: theme === "light" ? "#f0f2f5" : "#06080c",
    colorScheme: "light dark",
  };
}

type CcLayoutProps = {
  children: React.ReactNode;
};

export default async function CcLayout(props: CcLayoutProps) {
  const preference = parseThemePreference(
    (await cookies()).get(CC_THEME_COOKIE)?.value
  );
  return (
    <CcThemeRoot
      preference={preference}
      theme={resolveTheme({ preference, now: new Date() })}
      className={cn(
        "cc-theme fixed inset-0 z-[100] overflow-auto antialiased",
        "font-[family-name:var(--font-geist-mono)] text-[12px] leading-[18px]",
        "[--cc-font-display:var(--font-geist-sans)]",
        GeistSans.variable,
        GeistMono.variable
      )}
    >
      {props.children}
    </CcThemeRoot>
  );
}
