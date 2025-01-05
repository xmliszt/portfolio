'use client';

import { Disc } from '@phosphor-icons/react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from 'lucide-react';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { Bgm } from './bgm';

type BGMPlayerProps = {
  showBgmInfo: boolean;
  bgmInfoPosition: 'left' | 'right';
};

export function BGMPlayer(props: BGMPlayerProps) {
  const bgmStore = Bgm.getInstance().store();

  return (
    <div
      className={cn(
        'flex h-12 flex-row items-center gap-2 md:h-16 md:gap-4',
        bgmStore.currentBgm
          ? 'visible translate-y-0 opacity-100'
          : 'invisible translate-y-1 opacity-0',
        'transition-[transform_opacity] duration-300 ease-out'
      )}
    >
      {bgmStore.currentBgm &&
        props.showBgmInfo &&
        props.bgmInfoPosition === 'left' && (
          <BGMController
            title={bgmStore.currentBgm.title}
            artist={bgmStore.currentBgm.artist}
            href={bgmStore.currentBgm.external_url}
          />
        )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => {
              if (!bgmStore.isLoading) Bgm.getInstance().toggle();
            }}
            className={cn(
              'transition-transform ease-in-out',
              bgmStore.isLoading
                ? 'animate-pulse cursor-progress duration-1000'
                : 'cursor-pointer duration-300 hover:rotate-[360deg] hover:scale-125'
            )}
          >
            <Disc
              size={24}
              className={cn(
                'transition-transform',
                bgmStore.isPlaying && !bgmStore.isLoading
                  ? 'animate-spin'
                  : 'animate-none'
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
      {bgmStore.currentBgm &&
        props.showBgmInfo &&
        props.bgmInfoPosition === 'right' && (
          <BGMController
            title={bgmStore.currentBgm.title}
            artist={bgmStore.currentBgm.artist}
            href={bgmStore.currentBgm.external_url}
          />
        )}
    </div>
  );
}

function BGMController(props: { title: string; artist: string; href: string }) {
  return (
    <div className={cn('flex flex-row items-stretch gap-2')}>
      <div className='hidden flex-col items-center justify-between md:flex'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='text-muted-foreground transition-[transform_color] hover:scale-105 hover:text-primary'
              onClick={() => Bgm.getInstance().playPrevious()}
            >
              <ChevronUp className='size-4' />
            </button>
          </TooltipTrigger>
          <TooltipContent>previous song</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='text-muted-foreground transition-[transform_color] hover:scale-105 hover:text-primary'
              onClick={() => Bgm.getInstance().playNext()}
            >
              <ChevronDown className='size-4' />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>next song</TooltipContent>
        </Tooltip>
      </div>
      <a href={props.href} target='_blank'>
        <div className='flex flex-col items-start justify-center gap-0 overflow-hidden text-ellipsis [&>*]:whitespace-nowrap'>
          <span className='text-xs font-semibold'>{props.title}</span>
          <span className='text-xs'>{props.artist}</span>
        </div>
      </a>
      <div className='flex flex-row items-stretch justify-center md:hidden'>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='text-muted-foreground transition-[transform_color] hover:scale-105 hover:text-primary'
              onClick={() => Bgm.getInstance().playPrevious()}
            >
              <ChevronLeft className='size-4' />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>previous song</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className='text-muted-foreground transition-[transform_color] hover:scale-105 hover:text-primary'
              onClick={() => Bgm.getInstance().playNext()}
            >
              <ChevronRight className='size-4' />
            </button>
          </TooltipTrigger>
          <TooltipContent side='bottom'>next song</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
