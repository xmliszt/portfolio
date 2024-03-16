'use client';

import { useEffect, useRef } from 'react';
import { Van } from '@phosphor-icons/react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { Button } from './button';

const SMOKE_INTERVAL = 400;

export function ExternalActionButtonLink(props: {
  href: string;
  title?: string;
  target?: string;
}) {
  const exhaustContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function generateSmoke() {
      // Generate smoke
      setInterval(() => {
        const smoke = document.createElement('div');
        exhaustContainer.current?.appendChild(smoke);
        // Remove smoke
        setTimeout(() => {
          exhaustContainer.current?.removeChild(
            exhaustContainer.current?.firstChild as Node
          );
        }, 1000);
      }, SMOKE_INTERVAL);
    }
    generateSmoke();
  }, []);

  return (
    <Link
      href={props.href}
      target={props.target}
      className='group flex justify-start'
    >
      <Button variant={'outline'} className='my-4 flex items-center gap-2'>
        {props.title ?? `Take me there | 带我去瞧瞧`}
        <div className='relative'>
          <Van size={20} className='animate-car-wobble' />
          <div
            ref={exhaustContainer}
            className={cn(
              'absolute bottom-0 left-1 h-full rotate-[-45deg]',
              '[&>*]:absolute [&>*]:bottom-0 [&>*]:right-0 [&>*]:z-10 [&>*]:h-2 [&>*]:w-2 [&>*]:animate-smoke [&>*]:rounded-full [&>*]:bg-stone-500 [&>*]:blur-[2px]'
            )}
          ></div>
          <div className='absolute bottom-[1.5px] h-[1px] w-full border-b border-stone-700' />
        </div>
      </Button>
    </Link>
  );
}
