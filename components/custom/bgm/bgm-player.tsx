'use client';

import { ChevronsLeft, ChevronsRight, Disc3 } from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { Bgm } from './bgm';

export function BGMPlayer() {
  const bgmStore = Bgm.getInstance().store();

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-x-3',
        bgmStore.currentBgm
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0',
        'transition-[transform_opacity] duration-300 ease-out'
      )}
    >
      {/* Previous button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className='text-primary transition-transform hover:scale-110'
            onClick={() => Bgm.getInstance().playPrevious()}
          >
            <ChevronsLeft className='size-4' strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent>previous song</TooltipContent>
      </Tooltip>

      {/* Disk button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              if (!bgmStore.isLoading) Bgm.getInstance().toggle();
            }}
            className={cn(
              'group transition-transform duration-1000 ease-in-out',
              bgmStore.isLoading
                ? 'animate-pulse cursor-progress'
                : 'cursor-pointer'
            )}
          >
            <Disc3
              strokeWidth={1.5}
              className={cn(
                'size-6',
                'transition-transform',
                bgmStore.isPlaying && !bgmStore.isLoading
                  ? 'animate-spin duration-1000'
                  : 'animate-none duration-300 group-hover:rotate-[360deg]'
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {(() => {
            if (bgmStore.isLoading) return 'loading the cassette...';
            if (bgmStore.isPlaying) return 'pause background music';
            return 'play background music';
          })()}
        </TooltipContent>
      </Tooltip>

      {/* Next button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className='text-primary transition-transform hover:scale-110'
            onClick={() => Bgm.getInstance().playNext()}
          >
            <ChevronsRight className='size-4' strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side='bottom'>next song</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function BGMInfo() {
  const bgmStore = Bgm.getInstance().store();

  return (
    <a
      href={bgmStore.currentBgm?.external_url}
      target='_blank'
      className={cn(
        'grow',
        bgmStore.currentBgm
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0',
        'transition-[transform_opacity] duration-300 ease-out'
      )}
    >
      <div className='flex flex-col items-center justify-center gap-0 overflow-hidden text-ellipsis *:whitespace-nowrap'>
        <span className='text-xs font-semibold'>
          {bgmStore.currentBgm?.title}
        </span>
        <span className='text-xs text-muted-foreground'>
          {bgmStore.currentBgm?.artist}
        </span>
      </div>
    </a>
  );
}
