import { Metadata, Viewport } from "next";
import { Gowun_Batang, IBM_Plex_Mono } from "next/font/google";

import { LAUNDROMAT_ORIGIN } from "@/lib/laundromat/hosts";
import { sceneConfig } from "@/lib/laundromat/scene-config";
import { toCssVariables } from "@/lib/laundromat/to-css-variables";
import { cn } from "@/lib/utils";

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

const title = "Laundromat";
const description =
  "A quiet laundromat in your browser. Do your laundry, play lo-fi on the TV, and leave a note in the shared notebook.";

export const metadata: Metadata = {
  metadataBase: new URL(LAUNDROMAT_ORIGIN),
  title,
  description,
  alternates: { canonical: LAUNDROMAT_ORIGIN },
  openGraph: {
    title,
    description,
    url: LAUNDROMAT_ORIGIN,
    siteName: title,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@xmliszt",
  },
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
      <style>{`[data-laundromat-root] { ${toCssVariables(sceneConfig.tokens)} }`}</style>
      {props.children}
    </div>
  );
}
