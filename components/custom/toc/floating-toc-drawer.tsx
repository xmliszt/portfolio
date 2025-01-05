'use client';

import { useState } from 'react';
import { ArticleNyTimes } from '@phosphor-icons/react';

import { Copyright } from '@/components/custom/copyright';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn, isAtCurrentTOC, slugify } from '@/lib/utils';

import { useTOC } from './toc-provider';

type FloatingTOCDrawerProps = {
  children: React.ReactNode;
};

export function FloatingTOCDrawer(props: FloatingTOCDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { showToc, toc, hash, setHash } = useTOC();

  function renderTOCTree(toc: Page['toc'], indents = 0) {
    return (
      <div className='m-0 flex w-full flex-col gap-y-1'>
        {toc.map((heading) => {
          return (
            <>
              <a
                key={heading.url}
                href={`#${slugify(heading.title)}`}
                className={cn(
                  'rounded-lg p-2 text-left text-xs text-secondary-foreground transition-colors',
                  'hover:bg-secondary',
                  isAtCurrentTOC(hash, heading.title)
                    ? 'bg-secondary font-semibold'
                    : 'font-normal'
                )}
                style={{
                  marginLeft: `${indents * 8}px`,
                  width: `calc(100% - ${indents * 8}px)`,
                }}
                onClick={() => {
                  isOpen && setIsOpen(false);
                  setHash(slugify(heading.title));
                }}
              >
                {heading.title}
              </a>
              {heading.items && renderTOCTree(heading.items, indents + 1)}
            </>
          );
        })}
      </div>
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
              <div className='absolute z-20 flex h-full w-full items-center justify-center'>
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
        <TooltipContent>table of contents</TooltipContent>
      </Tooltip>
      <DrawerContent
        className={cn(
          'flex flex-col gap-12 rounded-none rounded-t-lg text-sm focus-visible:outline-none',
          // hide the drawer handle
          '[&>*:first-child]:hidden'
        )}
      >
        {/* Custom drawer handle */}
        <div className='mx-auto mt-2 h-1 w-[60px] cursor-grab rounded-full bg-foreground'></div>
        {props.children}
        {/* Navigation items */}
        <nav className='prose flex w-full flex-col gap-2 p-3'>
          {renderTOCTree(toc)}
        </nav>
        {/* Copyright */}
        <Copyright />
      </DrawerContent>
    </Drawer>
  );
}
