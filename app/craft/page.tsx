import { Metadata } from 'next';

import { openGraph } from '@/app/metadata';

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
      <h1 className='text-center font-bold'>craft</h1>
    </article>
  );
}
