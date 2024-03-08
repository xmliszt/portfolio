'use client';

import { useState } from 'react';
import { ArticleNyTimes } from '@phosphor-icons/react';

import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, isAtCurrentTOC, slugify } from '@/lib/utils';

import { BGMPlayer } from '../bgm-player';
import { ThemeSwitch } from '../theme-switch';

import { useTOC } from './toc-provider';

export function FloatingTOCDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { showToc, toc, hash, setHash } = useTOC();

  function renderTOCTree(toc: Page['toc']) {
    return (
      <ul className='m-0 flex flex-col gap-2'>
        {toc.map((heading) => {
          return (
            <li key={heading.url} className='m-0 p-0'>
              <a
                href={`#${slugify(heading.title)}`}
                className={cn(
                  'rounded-lg p-2 text-secondary-foreground transition-colors ease-out hover:bg-secondary',
                  isAtCurrentTOC(hash, heading.title)
                    ? 'bg-secondary font-bold'
                    : 'font-normal'
                )}
                onClick={() => {
                  isOpen && setIsOpen(false);
                  setHash(slugify(heading.title));
                }}
              >
                {heading.title}
              </a>
              {heading.items && renderTOCTree(heading.items)}
            </li>
          );
        })}
      </ul>
    );
  }

  if (!showToc) return null;
  if (!toc) return null;
  if (toc.length === 0) return null;

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <DrawerTrigger
            asChild
            className={cn(
              'fixed bottom-10 right-4 z-50 md:left-10',
              'block md:hidden',
              'cursor-pointer'
            )}
          >
            <div className='group size-10'>
              <div
                className={cn(
                  'absolute z-20 flex h-full w-full items-center justify-center',
                  'transition-transform duration-300 ease-in-out group-hover:rotate-[360deg] group-hover:scale-90'
                )}
              >
                <ArticleNyTimes size={24} />
              </div>
              <div
                className={cn(
                  'z-10 h-full w-full rounded-full border p-2 text-secondary-foreground shadow-sm backdrop-blur-lg',
                  'transition-[transform_background_box-shadow] duration-300 ease-in-out group-hover:scale-105 group-hover:bg-background group-hover:shadow-lg'
                )}
              ></div>
            </div>
          </DrawerTrigger>
        </TooltipTrigger>
        <TooltipContent>Table of Contents</TooltipContent>
      </Tooltip>
      <DrawerContent
        className={cn(
          'flex flex-col gap-12 rounded-none rounded-t-lg focus-visible:outline-none',
          // hide the drawer handle
          '[&>*:first-child]:hidden'
        )}
      >
        {/* Custom drawer handle */}
        <div className='mx-auto mt-2 h-1 w-[60px] cursor-grab rounded-full bg-foreground'></div>
        {/* Top control */}
        <div className='absolute left-4 right-4 top-3 z-10 flex flex-row items-center justify-between'>
          {/* BGM Control */}
          <BGMPlayer bgmInfoPosition='right' showBgmInfo />
          {/* Theme switch */}
          <ThemeSwitch />
        </div>
        {/* Navigation items */}
        <nav className='prose flex flex-col gap-2 p-3'>
          {renderTOCTree(toc)}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}
