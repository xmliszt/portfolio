import { Metadata } from 'next';

import { ShadowSubtitle } from '@/app/[slug]/shadow-subtitle';
import { CraftStationLink } from '@/app/craft/components/craft-station-link';
import { Sandbox } from '@/app/craft/components/sandbox';
import { stations } from '@/app/craft/stations';
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
    <div className='flex flex-col gap-y-8'>
      <article className='prose prose-stone dark:prose-invert'>
        <h1 className='group relative'>
          craft
          <ShadowSubtitle>作坊</ShadowSubtitle>
        </h1>
        <p>
          I&apos;m building up a crafting space here. The idea is to be able to
          create a craft project, upload a design video clip, and then use the
          embedded code editor to try to re-create the design. The video clip
          can be previewed with adjustable speed.
        </p>
        <p>Still building up this space, so stay tuned :)</p>
      </article>

      {/* Project item grids */}
      <div className='flex flex-col gap-y-4'>
        {stations.map((station) => (
          <CraftStationLink key={station.id} station={station} />
        ))}
      </div>
    </div>
  );
}
