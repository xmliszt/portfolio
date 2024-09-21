import { Metadata } from 'next';

import { ShadowSubtitle } from '../[slug]/shadow-subtitle';

import { HobbyCard } from './hobby-card';

import { hobbies } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'My hobbies | 兴趣爱好',
    alternates: {
      canonical: '/hobbies',
    },
  };
}

export default function HobbiesPage() {
  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1 className='group relative'>
        hobbies
        <ShadowSubtitle>兴趣爱好</ShadowSubtitle>
      </h1>
      <div className='flex flex-col'>
        <p>
          My hobbies reflect my diverse interests. I enjoy <b>Studio Ghibli</b>{' '}
          <b>films</b> for their imaginative worlds. <b>Music</b> is a core part
          of my life; I play multiple instruments and <b>compose</b>.{' '}
          <b>Photography</b> allows me to capture and share beautiful moments.
          These pursuits bring joy, inspiration, and enrich my perspective.
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
