import { Sandpack } from '@codesandbox/sandpack-react';
import { Metadata } from 'next';
import { useTheme } from 'next-themes';

import { openGraph } from '@/app/metadata';
import { Sandbox } from './sandbox';
import { ShadowSubtitle } from '../[slug]/shadow-subtitle';

export function generateMetadata(): Metadata {
  return {
    title: 'craft | 作坊',
    alternates: { canonical: '/craft' },
    openGraph: {
      ...openGraph,
      title: 'Li Yuxuan | craft',
      description:
        'Where collections of inspiring designs are re-imagined and re-created through hands-on implementation.',
    },
  };
}

export default function CraftPage() {
  return (
    <article className='prose prose-stone dark:prose-invert'>
      <h1 className='group relative'>
        craft
        <ShadowSubtitle>作坊</ShadowSubtitle>
      </h1>
      <p>
        I'm building up a crafting space here. The idea is to be able to create
        a craft project, upload a design video clip, and then use the embedded
        code editor to try to re-create the design. The video clip can be
        previewed with adjustable speed.
      </p>
      <p>Still building up this space, so stay tuned :)</p>
      <div className='h-full w-full'>
        <Sandbox />
      </div>
    </article>
  );
}
