'use client';

import { MusicNotes } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

import { useBGM } from '../bgm-provider';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function BGMPlayer() {
  const { isPlaying, toggleBGM } = useBGM();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={toggleBGM}
          className={cn(
            isPlaying
              ? 'animate-float-up-and-down'
              : 'animate-none transition-transform duration-300 ease-out hover:scale-125'
          )}
        >
          <MusicNotes size={24} />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {isPlaying ? 'Pause' : 'Play'} background music
      </TooltipContent>
    </Tooltip>
  );
}
