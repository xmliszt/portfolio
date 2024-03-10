import { Metadata } from 'next';

import { FocusCard } from '@/components/ui/focus-card';

import { ShadowSubtitle } from '../[slug]/shadow-subtitle';

import { focus } from '#site/content';

export function generateMetadata(): Metadata {
  return {
    title: 'Focus space | 专注空间',
  };
}

export default function FocusPage() {
  // Sorted focus in desceding order by year and month
  const sortedFocus = focus.sort((a, b) => {
    if (a.year === b.year) {
      return b.month - a.month;
    } else {
      return b.year - a.year;
    }
  });

  const currentFocus = sortedFocus[0];
  const pastFocus = sortedFocus.slice(1);

  return (
    <article className='flex flex-col gap-12'>
      <h1 className='group relative'>
        Focus space
        <ShadowSubtitle>专注空间</ShadowSubtitle>
      </h1>
      <div className='flex flex-col gap-4'>
        <p>
          Welcome to the <b>focus space</b>. Every month, I will choose one
          thing to focus on aside from my daily work. The focus is something
          that I want to improve myself on, and this space is set up to keep
          track of my progress and share my thoughts along the way.
        </p>
        <p>
          欢迎来到<b>专注空间</b>
          。每个月，我会选择一个专注点作为工作之余自我提升的方向。而设置这个空间的初衷，是用来记录和分享我从中积累的点滴。
        </p>
      </div>
      <h2>Current focus 当前专注</h2>
      <FocusCard focus={currentFocus} />
      <h2>Past focus 过往专注</h2>
      <div className='flex flex-col gap-16'>
        {pastFocus.length > 0 ? (
          pastFocus.map((focus) => <FocusCard key={focus.slug} focus={focus} />)
        ) : (
          <span>No record yet... 无以往记录……</span>
        )}
      </div>
    </article>
  );
}
