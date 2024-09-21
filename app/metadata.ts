import { Metadata } from 'next';

export const openGraph: Metadata['openGraph'] = {
  title: "Yuxuan's digital playground",
  description:
    'Welcome to my digital playground, a little cozy place where ideas flow freely.',
  url: 'https://liyuxuan.dev/about',
  siteName: "Yuxuan's digital playground",
  images: [
    {
      url: '/profile/og.webp',
      width: 1280,
      height: 720,
      alt: "Yuxuan's digital playground",
    },
  ],
  locale: 'en_US',
  type: 'website',
};
