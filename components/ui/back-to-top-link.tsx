'use client';

import { ArticleMedium } from '@phosphor-icons/react';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';
import { CornerRightUp } from 'lucide-react';

export function BackToTopLink(props: { children: React.ReactNode }) {
  return (
    <div className='flex items-center gap-x-1.5'>
      {props.children}
      <Tooltip>
        <TooltipTrigger asChild>
          <a href='#top'>
            <CornerRightUp className='text-muted-foreground hover:text-foreground size-3 transition-colors' />
          </a>
        </TooltipTrigger>
        <TooltipContent>back to top</TooltipContent>
      </Tooltip>
    </div>
  );
}
