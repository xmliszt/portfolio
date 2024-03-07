'use client';

import { useEffect, useRef, useState } from 'react';
import { Disc } from '@phosphor-icons/react';

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
      }, 2000);
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
          <BGMInfo
            title={currentBGM.title}
            artist={currentBGM.artist}
            isShowing={isPlaying}
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
          <BGMInfo
            title={currentBGM.title}
            artist={currentBGM.artist}
            isShowing={isPlaying}
          />
        )}
    </div>
  );
}

function BGMInfo({
  title,
  artist,
  isShowing,
}: {
  title: string;
  artist: string;
  isShowing: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-start justify-center gap-0 overflow-hidden text-ellipsis md:gap-1 [&>*]:whitespace-nowrap',
        isShowing ? 'animate-fade-in-float-up' : 'animate-fade-out-float-down'
      )}
    >
      <span className='text-sm font-bold'>{title}</span>
      <span className='text-xs'>{artist}</span>
    </div>
  );
}
