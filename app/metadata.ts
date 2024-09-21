import type { Metadata } from 'next';

export const openGraph: Metadata['openGraph'] = {
  title: "Hi👋🏻, I'm Li Yuxuan.",
  description:
    'Welcome to my digital playground, a little cozy place where ideas flow freely.',
  url: 'https://liyuxuan.dev/about',
  siteName: "Hi👋🏻, I'm Li Yuxuan.",
  images: [
    {
      url: '/profile/og.webp',
      width: 1280,
      height: 720,
      alt: "Hi👋🏻, I'm Li Yuxuan.",
    },
  ],
  locale: 'en_US',
  type: 'website',
};
