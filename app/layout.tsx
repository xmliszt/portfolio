import { Analytics } from "@vercel/analytics/react";
import { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import { BGMInfo, BGMPlayer } from "@/components/custom/bgm/bgm-player";
import { BgmProvider } from "@/components/custom/bgm/bgm-provider";
import { Copyright } from "@/components/custom/copyright";
import {
  FloatingNavigationBar,
  FloatingNavigationBarContent,
  FloatingNavigationBarHeader,
  FloatingNavigationProvider,
} from "@/components/custom/floating-navigation-bar";
import {
  NavigationBar,
  NavigationBarItem,
} from "@/components/custom/navigation-bar";
import { ThemeSwitch } from "@/components/custom/theme-switch";
import { FloatingTOCDrawer } from "@/components/custom/toc/floating-toc-drawer";
import { FloatingTOCDrawerHeader } from "@/components/custom/toc/floating-toc-drawer-header";
import { TOCProvider } from "@/components/custom/toc/toc-provider";
import { TOCTree } from "@/components/custom/toc/toc-tree";
import { ThemeProvider } from "@/components/theme-provider";
import { GradientBlur } from "@/components/ui/gradient-blur";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { openGraph } from "./metadata";
import { ROUTES } from "./routes";
import { ScrollAreaWithTOCTracker } from "./scroll-area-with-toc-tracker";

import "./globals.css";

// Metadata for SEO
export const metadata: Metadata = {
  metadataBase: new URL("https://liyuxuan.dev"),
  title: "Hi👋🏻, I'm Li Yuxuan.",
  description:
    "Welcome to my digital playground, a little cozy place where ideas flow freely.",
  manifest: "/manifest.json",
  appleWebApp: {
    title: "Li Yuxuan",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/favicon.ico",
    apple: [
      {
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/android-chrome512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    other: {
      rel: "apple-touch-icon",
      url: "/apple-touch-icon.png",
    },
  },
  applicationName: "Li Yuxuan",
  keywords: [
    "Li Yuxuan",
    "personal website",
    "portfolio",
    "playground",
    "piano",
    "hobbies",
    "contacts",
    "projects",
    "posts",
    "playground",
  ],
  authors: [{ name: "Li Yuxuan", url: "https://liyuxuan.dev/about" }],
  creator: "Li Yuxuan",
  alternates: {
    canonical: "https://www.liyuxuan.dev/about",
  },
  category: "portfolio",
  openGraph: openGraph,
  twitter: {
    card: "summary_large_image",
    title: "Hi👋🏻, I'm Li Yuxuan.",
    description:
      "Welcome to my digital playground, a little cozy place where ideas flow freely.",
    siteId: "1704579643",
    creator: "@xmliszt",
    creatorId: "1704579643",
    images: ["/profile/og.webp"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0a0a" },
  ],
};

const fontInter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "bg-background flex max-h-screen min-h-screen w-screen flex-col items-center overflow-hidden antialiased",
          "selection:bg-neutral-600 selection:text-neutral-100",
          "dark:selection:bg-neutral-100 dark:selection:text-neutral-600",
          fontInter.className
        )}
      >
        <ThemeProvider>
          <TooltipProvider delayDuration={800}>
            <BgmProvider>
              <TOCProvider>
                <GradientBlur placement="top" position="fixed" />
                <main className="h-screen max-h-screen w-screen overflow-hidden">
                  <ScrollAreaWithTOCTracker>
                    <div
                      className={cn(
                        "relative mx-auto h-auto w-screen pb-64 [&>article]:mx-auto",
                        "px-8 pt-24 pb-44", // phone
                        "md:max-w-md md:pb-24", // tablet
                        "lg:max-w-xl lg:pb-24", // laptop
                        "xl:max-w-2xl xl:pb-24" // large desktop
                      )}
                    >
                      {/* Show when in desktop view port */}
                      <NavigationBar>
                        {ROUTES.map((route) => (
                          <NavigationBarItem key={route.path} href={route.path}>
                            {route.name}
                          </NavigationBarItem>
                        ))}
                      </NavigationBar>
                      {/* Main content area */}
                      {children}
                      {/* Right side floating TOC tree */}
                      <TOCTree />
                    </div>
                  </ScrollAreaWithTOCTracker>
                </main>
                <GradientBlur placement="bottom" position="fixed" />
                {/* Right side floating TOC drawer: show when in mobile view port */}
                <FloatingTOCDrawer>
                  <FloatingTOCDrawerHeader>
                    {/* BGM Control */}
                    <BGMPlayer />
                    {/* BGM Info */}
                    <BGMInfo />
                    {/* Theme switch */}
                    <ThemeSwitch showRing={false} />
                  </FloatingTOCDrawerHeader>
                </FloatingTOCDrawer>
              </TOCProvider>
              {/* Show when in mobile view port */}
              <FloatingNavigationProvider>
                <FloatingNavigationBar>
                  <FloatingNavigationBarHeader>
                    {/* BGM Control */}
                    <BGMPlayer />
                    {/* BGM Info */}
                    <BGMInfo />
                    {/* Theme switch */}
                    <ThemeSwitch showRing={false} />
                  </FloatingNavigationBarHeader>
                  <FloatingNavigationBarContent>
                    {ROUTES.map((route) => (
                      <NavigationBarItem key={route.path} href={route.path}>
                        {route.name}
                      </NavigationBarItem>
                    ))}
                  </FloatingNavigationBarContent>
                </FloatingNavigationBar>
              </FloatingNavigationProvider>
              {/* Theme switch */}
              <div className="fixed right-4 bottom-10 z-50 hidden md:right-10 md:block">
                <ThemeSwitch showRing />
              </div>
              {/* BGM player */}
              <div
                className={cn(
                  "fixed top-8 right-4 z-50 hidden items-center gap-x-4",
                  "md:right-10 md:flex"
                )}
              >
                <BGMInfo />
                <BGMPlayer />
              </div>
            </BgmProvider>
          </TooltipProvider>

          <Analytics />

          {/* Copyright */}
          <Copyright />
        </ThemeProvider>
      </body>
    </html>
  );
}
