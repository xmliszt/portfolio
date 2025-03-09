import { Metadata } from 'next';

import { openGraph } from '@/app/metadata';
import { CustomLink } from '@/components/ui/custom-link';
import { Ratings } from '@/components/ui/ratings';
import { TweetEmbedWrapper } from '@/components/ui/twitter-tweet-embed-wrapper';

export function generateMetadata(): Metadata {
  return {
    title: 'ASCII Animated Effect | ASCII动画效果',
    alternates: {
      canonical: '/playground/ascii-animated-effect',
    },
    openGraph: {
      ...openGraph,
      title: 'Li Yuxuan | ASCII Animated Effect',
      description:
        'Using Adobe After Effect, I created an ASCII animated 3D rotating text effect. The result was then converted to a GIF.',
    },
  };
}

export default function Page() {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='text-center font-bold'>
        ASCII Animated 3D Rotating Text Effect
      </h1>

      <div className='flex h-full w-full flex-col items-center gap-y-12'>
        <iframe
          src='https://codesandbox.io/embed/8pz3zg?view=Preview&module=%2Fsrc%2FApp.tsx&hidenavigation=1'
          style={{
            width: '100%',
            height: '800px',
            overflow: 'hidden',
            borderRadius: '12px',
          }}
          title='Rotating ASCII Effect Demo (Taboo AI)'
          allow='accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking'
          sandbox='allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts'
          className='rounded-lg border p-2'
        ></iframe>
      </div>
      <Ratings id='ascii-animated-effect' />
      <p>Inspired by X post from Alexander Avdeev:</p>
      <TweetEmbedWrapper tweetId={'1776521482195390622'} />
      <p>
        I followed the tutorial by{' '}
        <CustomLink
          href='https://www.youtube.com/@synthymental'
          target='_blank'
        >
          synthymental
        </CustomLink>{' '}
        for the ASCII effect, and another video by{' '}
        <CustomLink href='https://www.youtube.com/@SonduckFilm' target='_blank'>
          SonduckFilm
        </CustomLink>{' '}
        for rotating 3D text effect, to create this ASCII animated 3D rotating
        text effect in Adobe After Effect. The end result as a MPEG-4 video was
        then converted to GIF.
      </p>
      <iframe
        style={{ width: '100%', aspectRatio: '1.5' }}
        src='https://www.youtube.com/embed/3653zmCJDv0?si=yDJtGuD21F42Z3WS'
        title='YouTube video player'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        referrerPolicy='strict-origin-when-cross-origin'
        allowFullScreen
      ></iframe>
      <iframe
        style={{ width: '100%', aspectRatio: '1.5' }}
        src='https://www.youtube.com/embed/KIESgJnjoaE?si=ZuAa3TBm3S8EdeDF'
        title='YouTube video player'
        allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
        referrerPolicy='strict-origin-when-cross-origin'
        allowFullScreen
      ></iframe>
    </div>
  );
}
