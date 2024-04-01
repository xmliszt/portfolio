import { Metadata } from 'next';

import { DuneLightDarkThemeToggle } from '@/components/custom/theme-switch/dune-light-dark-theme-toggle';
import { ExternalActionButtonLink } from '@/components/ui/external-action-button-link';
import { Ratings } from '@/components/ui/ratings';

export function generateMetadata(): Metadata {
  return {
    title: 'Dune themed light dark mode toggle | 沙丘主题的明暗切换',
  };
}

export default function Page() {
  return (
    <div className='flex w-full flex-col items-center gap-2'>
      <h1 className='text-center font-bold'>{`I'm a Dune light dark mode toggle`}</h1>
      <h2>沙丘主题的明暗切换，点击按钮切换明暗模式</h2>
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
        在看完电影《沙丘》后，我突然想做这个明暗模式切换按钮，以捕捉厄拉克斯沙漠的标志性景观，沙虫（最大的沙虫）和保罗（男主）。
      </p>
      <p>
        I first made the design in Figma, so that I can export the individual
        elements into SVG conveniently. Then I experimented the implementation
        in CodeSandbox with Framer Motion. Once satisfied with the results, I
        moved the code to this portfolio page.
      </p>
      <p>
        If you are interested in the behind-the-scene, the code and design, do
        visit the focus page for this month here
        如果想看看后面的代码和设计源，你可以点击下方链接查看
      </p>
      <ExternalActionButtonLink
        href='/focus/2024-4'
        title='Take me to the focus | 带我去那儿'
      />
    </div>
  );
}
