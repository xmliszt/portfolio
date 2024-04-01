import { Metadata } from 'next';

import { ShadowSubtitle } from '../[slug]/shadow-subtitle';

import { HobbyCard } from './hobby-card';

import { hobbies } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'My hobbies | 兴趣爱好',
    alternates: {
      canonical: 'https://liyuxuan.dev/hobbies',
    },
  };
}

export default function HobbiesPage() {
  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1 className='group relative'>
        My hobbies
        <ShadowSubtitle>兴趣爱好</ShadowSubtitle>
      </h1>
      <div className='flex flex-col'>
        <p>
          In my spare time, I immerse myself in a diverse array of hobbies that
          reflect my multifaceted interests and passions. I find solace in the
          imaginative realms crafted by <b>Studio Ghibli</b>, where each{' '}
          <b>film</b>
          offers a captivating escape into worlds brimming with dreams, love,
          and kindness. <b>Music</b> is not just a pastime but a deeply
          ingrained part of my life — I&apos;ve honed my skills across various
          instruments, from piano and violin to guitar and beyond, allowing me
          to <b>compose</b> my own melodies and produce music that speaks to the
          heart. <b>Photography</b> serves as my visual storytelling medium,
          capturing fleeting moments and encapsulating the beauty found in the
          world around me. These hobbies not only provide me with endless joy
          and inspiration but also shape my perspective and enrich my life in
          countless ways.
        </p>
        <p>
          在我的空闲时间里，我有多方面的兴趣爱好。我在由<b>吉卜力</b>
          工作室打造的想象领域中找到了慰藉，在每一部<b>电影</b>
          中，我都能沉浸在充满梦想、爱和善良的世界中。<b>音乐</b>
          不仅仅是一种消遣，而是我生活中深深扎根的一部分——我在钢琴、小提琴和吉他等各种乐器上磨练自己的技能，让我能够
          <b>创作出自己的旋律</b>，制作出触动心灵的音乐。<b>摄影</b>
          是我视觉叙事的媒介，捕捉着流逝的时刻，封存着我周围世界的美丽。这些爱好不仅为我带来无尽的快乐和灵感，而且在无数方面塑造了我的观点，丰富了我的生活。
        </p>
      </div>
      {/* List of hobbies */}
      <div className='mt-4 flex flex-col gap-8'>
        {hobbies.map((hobby) => (
          <HobbyCard
            key={hobby.slug}
            href={`/hobbies/${hobby.slug}`}
            coverImageUrl={hobby.coverImageUrl}
            coverImageAlt={hobby.coverImageAlt}
            title={hobby.title}
            synopsis={hobby.synopsis}
          />
        ))}
      </div>
    </article>
  );
}
