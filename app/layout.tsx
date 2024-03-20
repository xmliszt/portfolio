import { Analytics } from '@vercel/analytics/react';
import { Metadata, Viewport } from 'next';
import { Inter, Junge } from 'next/font/google';

import { BGMProvider } from '@/components/bgm-provider';
import { BGMPlayer } from '@/components/custom/bgm-player';
import { FloatingNavigationBar } from '@/components/custom/floating-navigation-bar';
import { FloatingNavigationProvider } from '@/components/custom/floating-navigation-bar/floating-navigation-provider';
import { ThemeSwitch } from '@/components/custom/theme-switch';
import { FloatingTOCDrawer } from '@/components/custom/toc/floating-toc-drawer';
import { TOCProvider } from '@/components/custom/toc/toc-provider';
import { TOCTree } from '@/components/custom/toc/toc-tree';
import { ThemeProvider } from '@/components/theme-provider';
import { GradientBlur } from '@/components/ui/gradient-blur';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import {
  NavigationBar,
  NavigationBarItem,
} from '../components/custom/navigation-bar';

import { ROUTES } from './routes';
import { ScrollAreaWithTOCTracker } from './scroll-area-with-toc-tracker';

import './globals.css';

// Metadata for SEO
export const metadata: Metadata = {
  title: "Yuxuan's digital playground",
  description:
    'Welcome to my digital playground, a little cozy place where ideas flow freely.',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'Li Yuxuan',
    statusBarStyle: 'default',
  },
  icons: {
    icon: '/favicon.ico',
    apple: [
      {
        url: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/android-chrome512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    other: {
      rel: 'apple-touch-icon',
      url: '/apple-touch-icon.png',
    },
  },
  applicationName: 'Li Yuxuan',
  keywords: [
    'Li Yuxuan',
    'personal website',
    'portfolio',
    'blogs',
    'playground',
    'piano',
    'hobbies',
    'contacts',
    'projects',
    'posts',
    'playground',
  ],
  authors: [{ name: 'Li Yuxuan', url: 'https://liyuxuan.dev' }],
  creator: 'Li Yuxuan',
  alternates: {
    canonical: 'https://liyuxuan.dev',
  },
  category: 'portfolio',
  openGraph: {
    title: "Yuxuan's digital playground",
    description:
      'Welcome to my digital playground, a little cozy place where ideas flow freely.',
    url: 'https://liyuxuan.dev',
    siteName: "Yuxuan's digital playground",
    images: [
      {
        url: '/profile/og.webp',
        width: 2028,
        height: 1140,
        alt: "Yuxuan's digital playground",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Yuxuan's digital playground",
    description:
      'Welcome to my digital playground, a little cozy place where ideas flow freely.',
    siteId: '1704579643',
    creator: '@xmliszt',
    creatorId: '1704579643',
    images: ['/profile/og.webp'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfc' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a0a' },
  ],
};

const fontInter = Inter({
  subsets: ['latin'],
});

const fontJunge = Junge({
  subsets: ['latin'],
  weight: '400',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' suppressHydrationWarning>
      <ThemeProvider>
        <body
          className={cn(
            'flex max-h-screen min-h-screen w-screen flex-col items-center overflow-hidden bg-background antialiased',
            fontJunge.className,
            fontInter.className
          )}
        >
          <TooltipProvider delayDuration={0}>
            <TOCProvider>
              <GradientBlur placement='top' position='fixed' />
              <main className='h-screen max-h-screen w-screen overflow-hidden'>
                <ScrollAreaWithTOCTracker>
                  <div
                    className={cn(
                      'relative mx-auto h-full w-screen [&>article]:mx-auto',
                      'px-8 pb-40 pt-24', // phone
                      'md:max-w-md md:pb-24', // tablet
                      'lg:max-w-xl lg:pb-24', // laptop
                      'xl:max-w-2xl xl:pb-24' // large desktop
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
              <GradientBlur placement='bottom' position='fixed' />
              {/* Right side floating TOC drawer: show when in mobile view port */}
              <FloatingTOCDrawer />
            </TOCProvider>
            <BGMProvider>
              {/* Show when in mobile view port */}
              <FloatingNavigationProvider>
                <FloatingNavigationBar>
                  {ROUTES.map((route) => (
                    <NavigationBarItem key={route.path} href={route.path}>
                      {route.name}
                    </NavigationBarItem>
                  ))}
                </FloatingNavigationBar>
              </FloatingNavigationProvider>
              {/* Theme switch */}
              <div className='fixed bottom-10 right-4 z-50 hidden md:right-10 md:block'>
                <ThemeSwitch />
              </div>
              {/* BGM player */}
              <div className='fixed right-4 top-8 z-50 hidden md:right-10 md:block'>
                <BGMPlayer showBgmInfo bgmInfoPosition='left' />
              </div>
            </BGMProvider>
          </TooltipProvider>
          <Analytics />
        </body>
      </ThemeProvider>
    </html>
  );
}
