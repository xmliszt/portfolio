import { GeistSerifRegular } from "geist/font/serif/regular";
import { Metadata, Viewport } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import { PAWS_ORIGIN } from "@/lib/paws/paws-hosts";
import { PAWS_SEO } from "@/lib/paws/paws-seo";
import { RISO, RISO_CSS_VARIABLES } from "@/lib/paws/riso-inks";
import { cn } from "@/lib/utils";

import { PawsJsonLd } from "./paws-json-ld";

const fontMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--pw-font-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(PAWS_ORIGIN),
  title: PAWS_SEO.title,
  description: PAWS_SEO.description,
  applicationName: PAWS_SEO.name,
  alternates: { canonical: "/" },
  manifest: "/paws/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/paws/icon.svg", type: "image/svg+xml" },
      { url: "/paws/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/paws/icon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/paws/apple-touch-icon.png",
  },
  appleWebApp: { title: PAWS_SEO.name },
  openGraph: {
    type: "website",
    url: "/",
    siteName: PAWS_SEO.name,
    title: PAWS_SEO.shareTitle,
    description: PAWS_SEO.shareDescription,
    images: [
      {
        url: PAWS_SEO.shareImage.path,
        width: PAWS_SEO.shareImage.width,
        height: PAWS_SEO.shareImage.height,
        alt: PAWS_SEO.shareDescription,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAWS_SEO.shareTitle,
    description: PAWS_SEO.shareDescription,
    images: [PAWS_SEO.shareImage.path],
  },
  authors: [{ name: "Li Yuxuan", url: "https://liyuxuan.dev/about" }],
  creator: "Li Yuxuan",
  robots: { index: true, follow: true, "max-image-preview": "large" },
};

export const viewport: Viewport = {
  themeColor: RISO.paper,
  colorScheme: "light",
};

type PawsLayoutProps = {
  children: React.ReactNode;
};

export default function PawsLayout(props: PawsLayoutProps) {
  return (
    <div
      style={RISO_CSS_VARIABLES}
      className={cn(
        "fixed inset-0 z-[100] overflow-hidden antialiased",
        "bg-[var(--pw-paper)] font-[family-name:var(--pw-font-mono)] text-[var(--pw-ink)]",
        "[--pw-font-display:var(--font-geist-serif-regular)]",
        GeistSerifRegular.variable,
        fontMono.variable
      )}
    >
      <PawsJsonLd />
      {props.children}
    </div>
  );
}
