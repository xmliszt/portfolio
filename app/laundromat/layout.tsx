import { Metadata, Viewport } from "next";
import { Gowun_Batang, IBM_Plex_Mono } from "next/font/google";

import { getCursorCss } from "@/lib/laundromat/get-cursor-css";
import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { en } from "@/lib/laundromat/i18n/copy/en";
import { getLaundromatLocaleMetadata } from "@/lib/laundromat/i18n/get-laundromat-locale-metadata";
import { DEFAULT_LAUNDROMAT_LOCALE } from "@/lib/laundromat/i18n/laundromat-locales";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { getDaylitTokenCss } from "@/lib/laundromat/get-daylit-token-css";
import { toCssVariables } from "@/lib/laundromat/to-css-variables";
import { cn } from "@/lib/utils";

import { LaundromatCursor } from "./laundromat-cursor";

const fontDisplay = Gowun_Batang({
  subsets: ["latin"],
  weight: "400",
  variable: "--lm-font-display",
});

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--lm-font-mono",
});

export const metadata: Metadata = {
  ...getLaundromatLocaleMetadata(DEFAULT_LAUNDROMAT_LOCALE),
  metadataBase: new URL(LAUNDROMAT_ORIGIN),
  title: { default: en.site.title, template: `%s · ${en.site.name}` },
  applicationName: en.site.name,
  appleWebApp: { title: en.site.name },
  manifest: "/laundromat/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/laundromat/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/laundromat/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/laundromat/apple-touch-icon.png",
  },
  authors: [{ name: "Li Yuxuan", url: "https://liyuxuan.dev/about" }],
  creator: "Li Yuxuan",
  publisher: "Li Yuxuan",
  category: "productivity",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: sceneConfig.tokens.bg,
  colorScheme: "dark",
};

type LaundromatLayoutProps = {
  children: React.ReactNode;
};

export default function LaundromatLayout(props: LaundromatLayoutProps) {
  return (
    <div
      data-laundromat-root
      className={cn(
        "fixed inset-0 z-[100] overflow-hidden antialiased",
        "bg-[var(--lm-bg)] font-[family-name:var(--lm-font-mono)] text-[var(--lm-ink)]",
        "selection:bg-[var(--lm-ink-hi)] selection:text-[var(--lm-bg)]",
        fontDisplay.variable,
        fontMono.variable
      )}
    >
      <style>{`[data-laundromat-root] { ${toCssVariables(sceneConfig.tokens)} }\n${getDaylitTokenCss(sceneConfig)}\n${getCursorCss(sceneConfig.tokens)}`}</style>
      {props.children}
      <LaundromatCursor />
    </div>
  );
}
