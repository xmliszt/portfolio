'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CaretDown,
  CaretUp,
  Disc,
  SkipBack,
  SkipForward,
} from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

import { useBGM } from '../bgm-provider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

type BGMPlayerProps = {
  showBgmInfo: boolean;
  bgmInfoPosition: 'left' | 'right';
};

export function BGMPlayer(props: BGMPlayerProps) {
  const { isPlaying, toggleBGM, currentBGM } = useBGM();
  const [isBGMInfoShowing, setIsBGMInfoShowing] = useState(false);
  const bgmFadeOutTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    clearTimeout(bgmFadeOutTimeout.current);
    if (isPlaying) {
      setIsBGMInfoShowing(true);
    } else {
      bgmFadeOutTimeout.current = setTimeout(() => {
        setIsBGMInfoShowing(false);
      }, 1000);
    }
    return () => {
      if (bgmFadeOutTimeout.current) {
        clearTimeout(bgmFadeOutTimeout.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className='flex h-12 flex-row items-center gap-2 md:h-16 md:gap-6'>
      {currentBGM &&
        isBGMInfoShowing &&
        props.showBgmInfo &&
        props.bgmInfoPosition === 'left' && (
          <BGMController
            title={currentBGM.title}
            artist={currentBGM.artist}
            isShowing={isPlaying}
            href={currentBGM.external_url}
          />
        )}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleBGM}
            className='transition-transform duration-300 ease-out hover:rotate-[360deg] hover:scale-125'
          >
            <Disc
              size={24}
              className={cn(
                'transition-transform',
                isPlaying ? 'animate-spin' : 'animate-none'
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          {isPlaying ? 'Pause' : 'Play'} background music
        </TooltipContent>
      </Tooltip>
      {currentBGM &&
        isBGMInfoShowing &&
        props.showBgmInfo &&
        props.bgmInfoPosition === 'right' && (
          <BGMController
            title={currentBGM.title}
            artist={currentBGM.artist}
            isShowing={isPlaying}
            href={currentBGM.external_url}
          />
        )}
    </div>
  );
}

function BGMController({
  title,
  artist,
  isShowing,
  href,
}: {
  title: string;
  artist: string;
  isShowing: boolean;
  href: string;
}) {
  const { nextBGM, prevBGM } = useBGM();
  return (
    <div
      className={cn(
        'flex flex-row items-stretch gap-2',
        isShowing ? 'animate-fade-in-float-up' : 'animate-fade-out-float-down'
      )}
    >
      <div className='hidden flex-col items-center justify-between md:flex'>
        <button
          className='text-muted-foreground transition-[transform_color] ease-out hover:scale-105 hover:text-primary'
          onClick={() => prevBGM()}
        >
          <CaretUp />
        </button>
        <button
          className='text-muted-foreground transition-[transform_color] ease-out hover:scale-105 hover:text-primary'
          onClick={() => nextBGM()}
        >
          <CaretDown />
        </button>
      </div>
      <a href={href} target='_blank'>
        <div className='flex flex-col items-start justify-center gap-0 overflow-hidden text-ellipsis [&>*]:whitespace-nowrap'>
          <span className='text-sm font-bold'>{title}</span>
          <span className='text-xs'>{artist}</span>
        </div>
      </a>
      <div className='flex flex-row items-stretch justify-center md:hidden'>
        <button
          className='text-muted-foreground transition-[transform_color] ease-out hover:scale-105 hover:text-primary'
          onClick={() => prevBGM()}
        >
          <SkipBack size={20} />
        </button>
        <button
          className='text-muted-foreground transition-[transform_color] ease-out hover:scale-105 hover:text-primary'
          onClick={() => nextBGM()}
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}
