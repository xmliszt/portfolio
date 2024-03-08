import { Van } from '@phosphor-icons/react/dist/ssr';

import { Button } from './button';

export function ExternalActionButtonLink(props: {
  href: string;
  title?: string;
  target?: string;
}) {
  return (
    <a
      href={props.href}
      target={props.target ?? '_blank'}
      className='group flex justify-start'
    >
      <Button variant={'outline'} className='my-4 flex items-center gap-2'>
        {props.title ?? `Take me there | 带我去瞧瞧`}
        <Van size={20} className='group-hover:animate-car-wobble' />
      </Button>
    </a>
  );
}
