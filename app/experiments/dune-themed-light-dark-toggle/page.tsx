import { Metadata } from 'next';

import { DuneLightDarkThemeToggle } from '@/components/custom/theme-switch/dune-light-dark-theme-toggle';
import { Ratings } from '@/components/ui/ratings';

export function generateMetadata(): Metadata {
  return {
    title: 'Dune themed light dark mode toggle | 沙丘主题的明暗切换',
    alternates: {
      canonical: '/experiments/dune-themed-light-dark-toggle',
    },
  };
}

export default function Page() {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='text-center font-bold'>{`I'm a Dune light dark mode toggle`}</h1>
      <p>Click the button to toggle light and dark mode.</p>
      <div className='grid h-[200px] w-full place-items-center'>
        <DuneLightDarkThemeToggle sizeInPixels={120} />
      </div>
      <Ratings id='dune-light-dark-toggle' />
      <p>
        After watching the movie Dune 2, I was inspired to create this light
        dark mode toggle button to capture the iconic dessert of the Arrakis,
        the Shai-Hulud (the largest sandworm), and Paul Atreides (the main
        character).
      </p>
      <p>
        I first made the design in Figma, so that I can export the individual
        elements into SVG conveniently. Then I experimented the implementation
        in CodeSandbox with Framer Motion. Once satisfied with the results, I
        moved the code to this portfolio page.
      </p>
    </div>
  );
}
