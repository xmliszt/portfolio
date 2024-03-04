import { Metadata, Viewport } from 'next';
import { Inter, Junge } from 'next/font/google';

import { FloatingNavigationBar } from '@/components/custom/floating-navigation-bar';
import { FloatingNavigationProvider } from '@/components/custom/floating-navigation-bar/floating-navigation-provider';
import { ThemeSwitch } from '@/components/custom/theme-switch';
import { ThemeProvider } from '@/components/theme-provider';
import { GradientBlur } from '@/components/ui/gradient-blur';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import {
  NavigationBar,
  NavigationBarItem,
} from '../components/custom/navigation-bar';

import './globals.css';

// Metadata for SEO
export const metadata: Metadata = {
  title: 'Li Yuxuan',
  description: "Yuxuan's personal repository",
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
  keywords: ['Li Yuxuan', 'personal website', 'portfolio', 'blog'],
  authors: [{ name: 'Li Yuxuan', url: 'https://liyuxuan.dev' }],
  creator: 'Li Yuxuan',
  alternates: {
    canonical: 'https://liyuxuan.dev',
  },
  category: 'portfolio',
  openGraph: {
    title: 'Li Yuxuan',
    description: "Yuxuan's personal repository",
    url: 'https://liyuxuan.dev',
    siteName: 'Li Yuxuan',
    images: [
      {
        url: 'https://i.imgur.com/IIP6UzK.jpeg',
        width: 800,
        height: 600,
        alt: "Li Yuxuan's personal website",
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Li Yuxuan',
    description: "Yuxuan's personal repository",
    siteId: '1704579643',
    creator: '@xmliszt',
    creatorId: '1704579643',
    images: ['https://i.imgur.com/IIP6UzK.jpeg'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
          <GradientBlur placement='top' position='fixed' />
          <main className='h-screen max-h-screen w-screen overflow-hidden'>
            <ScrollArea className='h-screen w-screen'>
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
                  <NavigationBarItem href='/'>About me</NavigationBarItem>
                  <NavigationBarItem href='/projects'>
                    Projects
                  </NavigationBarItem>
                  <NavigationBarItem href='/hobbies'>Hobbies</NavigationBarItem>
                  <NavigationBarItem href='/posts'>Posts</NavigationBarItem>
                  <NavigationBarItem href='/piano'>Piano</NavigationBarItem>
                  <NavigationBarItem href='/contacts'>
                    Contacts
                  </NavigationBarItem>
                </NavigationBar>
                {/* Main content area */}
                {children}
              </div>
            </ScrollArea>
          </main>
          <GradientBlur placement='bottom' position='fixed' />
          {/* Show when in mobile view port */}
          <FloatingNavigationProvider>
            <FloatingNavigationBar>
              <NavigationBarItem href='/'>About me</NavigationBarItem>
              <NavigationBarItem href='/projects'>Projects</NavigationBarItem>
              <NavigationBarItem href='/hobbies'>Hobbies</NavigationBarItem>
              <NavigationBarItem href='/posts'>Posts</NavigationBarItem>
              <NavigationBarItem href='/piano'>
                Play some piano
              </NavigationBarItem>
              <NavigationBarItem href='/contacts'>Contacts</NavigationBarItem>
            </FloatingNavigationBar>
          </FloatingNavigationProvider>
          {/* Theme switch */}
          <div className='fixed bottom-10 right-4 z-50 hidden md:right-10 md:block'>
            <ThemeSwitch />
          </div>
        </body>
      </ThemeProvider>
    </html>
  );
}
