'use client';

import { ArticleMedium } from '@phosphor-icons/react';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export function BackToTopLink(props: { children: React.ReactNode }) {
  return (
    <div className='flex items-center gap-3'>
      {props.children}
      <Tooltip>
        <TooltipTrigger asChild>
          <a href='#top'>
            <ArticleMedium />
          </a>
        </TooltipTrigger>
        <TooltipContent>back to top</TooltipContent>
      </Tooltip>
    </div>
  );
}
